<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Icon from "@/lib/Icon.svelte";
  import PageError from "@/lib/PageError.svelte";
  import Spinner from "@/lib/Spinner.svelte";
  import tooltip from "@/lib/actions/tooltip";
  import FilterMenu from "@/lib/nav/FilterMenu.svelte";
  import FollowingMenu from "@/lib/nav/FollowingMenu.svelte";
  import SortMenu from "@/lib/nav/SortMenu.svelte";
  import { isTouch, parseTokenPayload, userHasPermission } from "@/lib/util/helpers";
  import { notify } from "@/lib/util/notify";
  import {
    activeFilters,
    activeSort,
    clearAllStores,
    defaultSort,
    follows,
    searchQuery,
    serverFeatures,
    userInfo,
    userSettings,
    watchedList
  } from "@/store";
  import { type Filters, UserPermission } from "@/types";
  import axios from "axios";
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  let navEl: HTMLElement;
  let searchTimeout: NodeJS.Timeout;
  let subMenuShown = false;
  let filterMenuShown = false;
  let sortMenuShown = false;
  let followingMenuShown = false;

  $: settings = $userSettings;
  $: user = $userInfo;

  function handleProfileClick() {
    if (!localStorage.getItem("token")) {
      goto("/login");
    } else {
      closeAllSubMenus("sub");
      subMenuShown = !subMenuShown;
    }
  }

  function handleSearch(ev: KeyboardEvent) {
    if (
      ev.key === "Tab" ||
      ev.key === "CapsLock" ||
      ev.key === "OS" ||
      ev.key === "ArrowLeft" ||
      ev.key === "ArrowRight" ||
      ev.key === "ArrowUp" ||
      ev.key === "ArrowDown"
    )
      return;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(
      () => {
        const target = ev.target as HTMLInputElement;
        const query = target?.value.trim();
        if (!query) return;
        if (query) {
          // Enable autofocus before running `goto` because on chromium
          // the .focus() call won't work, even after a timeout.
          // Using autofocus seems to work. Disables after goto runs.
          // https://github.com/sbondCo/Watcharr/issues/169
          target.autofocus = true;
          goto(`/search/${query}`).then(() => {
            target?.focus();
            target.autofocus = false;
          });
        }
      },
      isTouch() ? 800 : 400
    );
  }

  function logout() {
    localStorage.removeItem("token");
    clearAllStores();
    goto("/login");
  }

  function profile() {
    goto("/profile");
    subMenuShown = false;
  }

  function serverSettings() {
    goto("/server");
    subMenuShown = false;
  }

  function shareWatchedList() {
    const nid = notify({ type: "loading", text: "Getting link" });
    const ud = parseTokenPayload();
    console.log(ud);
    if (ud?.userId && ud?.username) {
      const shareLink = `${window.location.origin}/lists/${ud.userId}/${ud.username}`;
      navigator.clipboard
        .writeText(shareLink)
        .then(() => {
          notify({ id: nid, type: "success", text: "Copied share link" });
        })
        .catch((r) => {
          console.error("Failed to copy list share link", r);
          notify({
            id: nid,
            type: "error",
            text: `Failed to copy share link:<br/><a href="${shareLink}" target="_blank">${shareLink}</a>`,
            time: 20000
          });
        });
    } else {
      notify({ id: nid, type: "error", text: "Failed to get link" });
    }
  }

  async function getInitialData() {
    if (localStorage.getItem("token")) {
      const [w, u, s, f, fo] = await Promise.all([
        axios.get("/watched"),
        axios.get("/user"),
        axios.get("/user/settings"),
        axios.get("/features"),
        axios.get("/follow")
      ]);
      if (w?.data?.length > 0) {
        watchedList.update((wl) => (wl = w.data));
      }
      if (u?.data) {
        userInfo.update((ui) => (ui = u.data));
      }
      if (s?.data) {
        userSettings.update((us) => (us = s.data));
      }
      if (f?.data) {
        serverFeatures.update((sf) => (sf = f.data));
      }
      if (fo?.data) {
        follows.update((f) => (f = fo.data));
      }
    } else {
      goto("/login?again=1");
    }
  }

  function closeAllSubMenus(except?: string) {
    if (except !== "sub") subMenuShown = false;
    if (except !== "filter") filterMenuShown = false;
    if (except !== "sort") sortMenuShown = false;
    if (except !== "following") followingMenuShown = false;
  }

  onMount(() => {
    if (navEl) {
      let scroll = window.scrollY;
      window.document.addEventListener("scroll", (ev: Event) => {
        if (scroll > window.scrollY) {
          navEl?.classList.remove("scrolled-down");
          document.body.classList.add("nav-shown");
        } else {
          navEl?.classList.add("scrolled-down");
          document.body.classList.remove("nav-shown");
          closeAllSubMenus();
        }
        scroll = window.scrollY;
      });
    } else {
      console.error("navEl doesn't exist, failed to initialize up/down listener");
    }
  });
</script>

<nav bind:this={navEl}>
  <a href="/">
    <span class="large">Watcharr</span>
    <span class="small">W</span>
  </a>
  <input type="text" placeholder="Search" bind:value={$searchQuery} on:keydown={handleSearch} />
  <div class="btns">
    <!-- Show on watched list and shared/followed watched lists -->
    {#if $page.url?.pathname === "/" || $page.url?.pathname.includes("/lists/")}
      <button
        class="plain other filter"
        on:click={() => {
          closeAllSubMenus("filter");
          filterMenuShown = !filterMenuShown;
        }}
        use:tooltip={{ text: "Filter", pos: "bot", condition: !filterMenuShown }}
      >
        <Icon i="filter" />
        {#if $activeFilters?.type?.length > 0 || $activeFilters?.status?.length > 0}
          <div class="indicator"></div>
        {/if}
      </button>
      <button
        class="plain other sort"
        on:click={() => {
          closeAllSubMenus("sort");
          sortMenuShown = !sortMenuShown;
        }}
        use:tooltip={{ text: "Sort", pos: "bot", condition: !sortMenuShown }}
      >
        <Icon i="sort" />
        <!-- Show indicator if not equal to default and second item in array is not falsy -->
        {#if $activeSort?.length === 2 && $activeSort[1] && JSON.stringify($activeSort) !== JSON.stringify(defaultSort)}
          <div class="indicator"></div>
        {/if}
      </button>
      {#if sortMenuShown}
        <SortMenu />
      {/if}
      {#if filterMenuShown}
        <FilterMenu />
      {/if}
    {/if}
    <button
      class="plain other discover"
      on:click={() => goto("/discover")}
      use:tooltip={{ text: "Discover", pos: "bot" }}
    >
      <Icon i="compass" wh={26} />
    </button>
    <button
      class="plain other following"
      on:click={() => {
        closeAllSubMenus("following");
        followingMenuShown = !followingMenuShown;
      }}
      use:tooltip={{ text: "Following", pos: "bot", condition: !followingMenuShown }}
    >
      <Icon i="people" wh={26} />
    </button>
    {#if followingMenuShown}
      <FollowingMenu close={() => (followingMenuShown = false)} />
    {/if}
    <button class="plain face" on:click={handleProfileClick}>:)</button>
    {#if subMenuShown}
      <div class="menu face-menu">
        <div>
          {#if user?.username}
            <h5 title={user.username}>Hi {user.username}!</h5>
          {/if}
          <button class="plain" on:click={() => profile()}>Profile</button>
          {#if !settings?.private}
            <button class="plain" on:click={() => shareWatchedList()}>Share List</button>
          {/if}
          {#if user && userHasPermission(user.permissions, UserPermission.PERM_ADMIN)}
            <button class="plain" on:click={() => serverSettings()}>Settings</button>
          {/if}
          <button class="plain" on:click={() => logout()}>Logout</button>
          <!-- svelte-ignore missing-declaration -->
          <span>v{__WATCHARR_VERSION__}</span>
        </div>
      </div>
    {/if}
  </div>
</nav>

{#await getInitialData()}
  <Spinner />
{:then}
  <slot />
{:catch err}
  <PageError pretty="Failed to retrieve user data!" error={err} />
{/await}

<style lang="scss">
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 10px 20px;
    position: sticky;
    top: 0;
    gap: 20px;
    z-index: 99990;
    backdrop-filter: blur(2.5px) saturate(120%);
    background-color: $nav-color;
    transition: top 200ms ease-in-out;

    &:global(.scrolled-down) {
      top: -71px;
    }

    a {
      text-decoration: none;
      font-family:
        "Shrikhand",
        system-ui,
        -apple-system,
        BlinkMacSystemFont;
      font-size: 35px;
      transition:
        -webkit-text-stroke 150ms ease,
        color 150ms ease,
        font-weight 150ms ease;

      &:hover,
      &:focus-visible {
        color: $bg-color;
        -webkit-text-stroke: 3px $text-color;
        font-weight: bold;
      }

      span.large {
        display: block;
        width: 185.2px;
      }

      span.small {
        display: none;
        width: 40px;
      }

      @media screen and (max-width: 620px) {
        span.large {
          display: none;
        }
        span.small {
          display: block;
        }
      }
    }

    input {
      width: 250px;
      font-weight: bold;
      text-align: center;
      box-shadow: 4px 4px 0px 0px $text-color;
      transition:
        width 150ms ease,
        box-shadow 150ms ease;

      &:hover,
      &:focus {
        box-shadow: 2px 2px 0px 0px $text-color;
      }
    }

    .btns {
      display: flex;
      flex-flow: row;
      /* gap: 20px; */

      button.other {
        padding-top: 2px;
        width: 28px;
        transition:
          fill 150ms ease,
          stroke 150ms ease,
          stroke-width 150ms ease;
        fill: $text-color;

        &:hover,
        &:focus-visible {
          :global(path) {
            fill: none;
            stroke: $text-color;
            stroke-width: 30px;
            stroke-linejoin: round;
          }
        }
      }

      button.filter {
        margin-right: 15px;
        &:hover,
        &:focus-visible {
          :global(path) {
            stroke-width: 15px;
          }
        }
      }

      button.sort {
        margin-right: 12px;
      }

      button.filter,
      button.sort {
        position: relative;

        .indicator {
          position: absolute;
          top: 1px;
          right: -6px;
          width: 6px;
          height: 6px;
          background-color: $text-color;
          border-radius: 50%;
        }
      }

      button.discover {
        margin-right: 12px;
        transition:
          fill 150ms ease,
          stroke 150ms ease,
          stroke-width 150ms ease,
          transform 150ms ease;

        &:hover,
        &:focus-visible {
          transform: rotate(60deg);
        }
      }

      button.following {
        margin-right: 17px;
      }

      button.face {
        font-family:
          "Shrikhand",
          system-ui,
          -apple-system,
          BlinkMacSystemFont;
        font-size: 25px;
        transform: rotate(90deg);
        cursor: pointer;
        margin-left: 3px;
        transition:
          -webkit-text-stroke 150ms ease,
          color 150ms ease;

        &:hover,
        &:focus-visible {
          color: $bg-color;
          -webkit-text-stroke: 1.5px $text-color;
        }
      }

      div.face-menu {
        &:before {
          right: 10px;
        }
      }
    }

    @media screen and (max-width: 666px) {
      input {
        width: 100%;

        &:focus + .btns button:not(.face) {
          display: none;
        }
      }
    }
  }
</style>
