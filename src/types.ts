export type WatchedStatus = "PLANNED" | "WATCHING" | "FINISHED" | "HOLD" | "DROPPED";
export type ContentType = "tv" | "movie";
export type MediaType = ContentType | "person";

// Wasn't able to figure out how to import this type from its component file in other places, so its here for now.
export type Icon =
  | "check"
  | "clock"
  | "calendar"
  | "thumb-down"
  | "play"
  | "pause"
  | "jellyfin"
  | "trash"
  | "close"
  | "filter"
  | "reel"
  | "compass"
  | "document"
  | "add"
  | "arrow"
  | "chevron"
  | "search"
  | "sort"
  | "eye-closed"
  | "people"
  | "person"
  | "person-add"
  | "person-minus";

export type Theme = "light" | "dark";

export enum UserType {
  // Assume watcharr user if none of these...
  Jellyfin = 1
}

interface dbModel {
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface Content {
  // id: number; // Not used
  tmdbId: number;
  title: string;
  poster_path: string;
  overview: string;
  type: ContentType;
  release_date: string;
  first_air_date: string;
}

export interface Activity extends dbModel {
  watchedId: number;
  type: string;
  data: string;
  customDate: string;
}

export interface WatchedSeason {
  id: number;
  watchedID: number;
  status: WatchedStatus;
  rating: number;
  seasonNumber: number;
}

export interface Watched extends dbModel {
  id: number;
  watched: boolean;
  rating?: number;
  content: Content;
  activity: Activity[];
  status: WatchedStatus;
  thoughts: string;
  watchedSeasons?: WatchedSeason[];
}

export interface WatchedAddRequest {
  contentId: number;
  contentType: ContentType;
  rating?: number;
  status: WatchedStatus;
}

export interface WatchedUpdateRequest {
  rating?: number;
  status?: WatchedStatus;
  thoughts?: string;
  removeThoughts?: boolean;
}

export interface WatchedUpdateResponse {
  newActivity: Activity;
}

export interface WatchedSeasonAddResponse {
  watchedSeasons: WatchedSeason[];
  addedActivity: Activity;
}

export interface Profile {
  joined: Date;
  showsWatched: number;
  moviesWatched: number;
}

export interface UserSettings {
  private: boolean;
  hideSpoilers: boolean;
}

// What the user search returns
export interface PublicUser {
  id: number;
  username: string;
  avatar: Image;
  bio: string;
}

// PrivateUser - Current users info
export interface PrivateUser {
  username: string;
  type: UserType;
  permissions: UserPermission;
  avatar: Image;
  bio: string;
}

export enum UserPermission {
  PERM_NONE = 1,
  PERM_ADMIN = 2,
  PERM_REQUEST_CONTENT = 4
}

export interface Image {
  createdAt: Date;
  blurHash: string;
  path: string;
}

export interface JellyfinFoundContent {
  hasContent: boolean;
  url: string;
}

export interface AvailableAuthProviders {
  available: string[];
  signupEnabled: boolean;
  isInSetup: boolean;
}

export interface TokenClaims {
  userId: number;
  username: string;
  type: number;
}

export interface FileWithData {
  file: File;
  data: string;
}

export interface TMDBContentDetails {
  id: number;
  backdrop_path: string;
  genres: {
    id: number;
    name: string;
  }[];
  poster_path: string;
  homepage: string;
  popularity: number;
  overview: string;
  original_language: string;
  production_companies: {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  status: string;
  tagline: string;
  vote_average: number;
  vote_count: number;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
}

export interface TMDBMovieDetails extends TMDBContentDetails {
  adult: boolean;
  belongs_to_collection: object;
  budget: number;
  imdb_id: string;
  original_title: string;
  release_date: string;
  revenue: number;
  runtime: number;
  title: string;
  video: boolean;
  videos: TMDBContentVideos;
  "watch/providers": TMDBContentWatchProviders;
  similar: TMDBMovieSimilar;
  external_ids: TMDBExternalIdsMovie;
}

export interface TMDBShowDetails extends TMDBContentDetails {
  created_by: {
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string;
  }[];
  episode_run_time: number[];
  first_air_date: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string;
    vote_average: number;
    vote_count: number;
  };
  name: string;
  next_episode_to_air: object;
  networks: {
    name: string;
    id: number;
    logo_path: string;
    origin_country: string;
  }[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_name: string;
  seasons: TMDBShowSeason[];
  type: string;
  videos: TMDBContentVideos;
  "watch/providers": TMDBContentWatchProviders;
  similar: TMDBShowSimilar;
  external_ids: TMDBExternalIdsShow;
  keywords: TMDBKeywords;
}

export interface TMDBWatchProvider {
  logo_path: string;
  provider_id: string;
  provider_name: string;
  display_priority: string;
}

export interface TMDBContentWatchProviders {
  link: string;
  flatrate: TMDBWatchProvider[];
  free: TMDBWatchProvider[];
}

export interface TMDBContentVideos {
  id: number;
  results: {
    iso_639_1: string;
    iso_3166_1: string;
    name: string;
    key: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
    id: string;
  }[];
}

export interface TMDBShowSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
}

export interface TMDBSeasonDetails {
  _id: string;
  air_date: string;
  episodes: TMDBSeasonDetailsEpisode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string;
  season_number: number;
}

export interface TMDBSeasonDetailsEpisode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
  crew: {
    department: string;
    job: string;
    credit_id: string;
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string;
  }[];
  guest_stars: {
    character: string;
    credit_id: string;
    order: number;
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string;
  }[];
}

export interface TMDBContentCredits {
  id: number;
  cast: {
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string;
    cast_id: number;
    character: string;
    credit_id: string;
    order: number;
  }[];
  crew: TMDBContentCreditsCrew[];
}

export interface TMDBContentCreditsCrew {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  credit_id: string;
  department: string;
  job: string;
}

export interface TMDBShowSimilar {
  page: number;
  results: {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    first_air_date: string;
    name: string;
    vote_average: number;
    vote_count: number;
  }[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovieSimilar {
  page: number;
  results: {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
  }[];
  total_pages: number;
  total_results: number;
}

export interface TMDBPersonDetails {
  birthday?: string;
  known_for_department?: string;
  deathday?: string;
  id?: number;
  name?: string;
  also_known_as?: string[];
  gender?: number;
  biography?: string;
  popularity?: number;
  place_of_birth?: string;
  profile_path?: string;
  adult?: boolean;
  imdb_id?: string;
  homepage?: string;
}

export interface TMDBPersonCombinedCredits {
  id: number;
  cast: TMDBPersonCombinedCreditsCast[];
}

export interface TMDBPersonCombinedCreditsCast {
  id: number;
  original_language: string;
  episode_count: number;
  overview: string;
  origin_country: string[];
  original_name: string;
  genre_ids: number[];
  name: string;
  media_type: MediaType;
  poster_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  character: string;
  backdrop_path: string;
  popularity: number;
  credit_id: string;
  original_title: string;
  video: boolean;
  release_date: string;
  title: string;
  adult: boolean;
}

export interface TMDBDiscoverMovies {
  page: number;
  results: {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
  }[];
  total_pages: number;
  total_results: number;
}

export interface TMDBDiscoverShows {
  page: number;
  results: {
    backdrop_path: string;
    first_air_date: string;
    genre_ids: number[];
    id: number;
    name: string;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    vote_average: number;
    vote_count: number;
  }[];
  total_pages: number;
  total_results: number;
}

export interface TMDBTrendingAll {
  page: number;
  results: {
    adult: boolean;
    backdrop_path: string;
    id: number;
    title?: string;
    original_language: string;
    original_title?: string;
    overview: string;
    poster_path: string;
    media_type: MediaType;
    genre_ids: number[];
    popularity: number;
    release_date?: string;
    video?: boolean;
    vote_average: number;
    vote_count: number;
    name?: string;
    original_name?: string;
    first_air_date?: string;
    origin_country?: string[];
  }[];
  total_pages: number;
  total_results: number;
}

export interface TMDBUpcomingMovies {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  results: {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
  }[];
  total_pages: number;
  total_results: number;
}

export interface TMDBUpcomingShows {
  page: number;
  results: {
    backdrop_path: string;
    first_air_date: string;
    genre_ids: number[];
    id: number;
    name: string;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    vote_average: number;
    vote_count: number;
  }[];
  total_pages: number;
  total_results: number;
}

export interface TMDBExternalIds {
  id: number;
  imdb_id: string;
  wikidata_id: string;
  facebook_id: string;
  instagram_id: string;
  twitter_id: string;
}

export interface TMDBExternalIdsMovie extends TMDBExternalIds {}

export interface TMDBExternalIdsShow extends TMDBExternalIds {
  freebase_mid: string;
  freebase_id: string;
  tvdb_id: number;
  tvrage_id: number;
}

export interface TMDBKeywords {
  results: {
    name: string;
    id: number;
  }[];
}

export interface ContentSearch {
  page: number;
  results: (ContentSearchMovie | ContentSearchTv | ContentSearchPerson)[];
  total_pages: number;
  total_results: number;
}

export interface ContentSearchMovie {
  poster_path?: string;
  adult?: boolean;
  overview?: string;
  release_date?: string;
  original_title?: string;
  genre_ids?: number[];
  id: number;
  media_type: "movie";
  original_language?: string;
  title?: string;
  backdrop_path?: string;
  popularity?: number;
  vote_count?: number;
  video?: boolean;
  vote_average?: number;
}

export interface ContentSearchTv {
  poster_path?: string;
  popularity?: number;
  id: number;
  overview?: string;
  backdrop_path?: string;
  vote_average?: number;
  media_type: "tv";
  first_air_date?: string;
  origin_country?: string[];
  genre_ids?: number[];
  original_language?: string;
  vote_count?: number;
  name?: string;
  original_name?: string;
}

export interface ContentSearchPerson {
  profile_path?: string;
  adult?: boolean;
  id?: number;
  media_type: "person";
  known_for?: ContentSearchMovie | ContentSearchTv;
  name?: string;
  popularity?: number;
}

export enum ImportResponseType {
  IMPORT_SUCCESS = "IMPORT_SUCCESS",
  IMPORT_FAILED = "IMPORT_FAILED",
  IMPORT_MULTI = "IMPORT_MULTI",
  IMPORT_NOTFOUND = "IMPORT_NOTFOUND",
  IMPORT_EXISTS = "IMPORT_EXISTS"
}

export interface ImportResponse {
  type: ImportResponseType;
  results: (ContentSearchMovie | ContentSearchTv)[];
  match?: ContentSearchMovie | ContentSearchTv;
  watchedEntry?: Watched;
}

export interface ImportedList {
  tmdbId?: number;
  name: string;
  year?: string;
  type?: ContentType;
  state?: string;
  rating?: number;
  ratingCustomDate?: Date;
}

export interface Filters {
  type: string[];
  status: string[];
}

export interface ServerConfig {
  JELLYFIN_HOST: string;
  SIGNUP_ENABLED: boolean;
  TMDB_KEY: string;
  SONARR: SonarrSettings[];
  RADARR: RadarrSettings[];
  DEBUG: boolean;
}

export interface SonarrSettings {
  name: string;
  host?: string;
  key?: string;
  qualityProfile?: number;
  rootFolder?: number;
  languageProfile?: number;
  automaticSearch?: boolean;
}

export interface RadarrSettings {
  name: string;
  host?: string;
  key?: string;
  qualityProfile?: number;
  rootFolder?: number;
  automaticSearch?: boolean;
}

export interface DropDownItem {
  id: number;
  value: string;
}

export interface ListBoxItem {
  id: number;
  value: boolean;
  displayValue: string;
}

export interface QualityProfile {
  name: string;
  upgradeAllowed: boolean;
  cutoff: number;
  items: {
    quality?: {
      id: number;
      name: string;
      source: string;
      resolution: number;
    };
    items: any[];
    allowed: boolean;
    name?: string;
    id?: number;
  }[];
  id: number;
}

export interface RootFolder {
  path: string;
  accessible: boolean;
  freeSpace: number;
  unmappedFolders: any[];
  id: number;
}

export interface LanguageProfile {
  name: string;
  upgradeAllowed: boolean;
  cutoff: {
    id: number;
    name: string;
  };
  languages: {
    language: {
      id: number;
      name: string;
    };
    allowed: boolean;
  }[];
  id: number;
}

export interface SonarrTestResponse {
  qualityProfiles: QualityProfile[];
  rootFolders: RootFolder[];
  languageProfiles: LanguageProfile[];
}

export interface RadarrTestResponse {
  qualityProfiles: QualityProfile[];
  rootFolders: RootFolder[];
}

export interface ServerFeatures {
  sonarr: boolean;
  radarr: boolean;
}

export interface Follow {
  createdAt: Date;
  followedUser: PublicUser;
}
