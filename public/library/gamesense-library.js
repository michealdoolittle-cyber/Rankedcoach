(function () {
  "use strict";

  const state = { topic: "overview", itemId: "", role: "", detailId: "", mapView: "locations", tipView: "attack", mapZoom: 1, compAgent: "", compRole: "Controller", agentRole: "all", mapSeason: "in", playlistFilter: "Home", crosshairTab: "All", crosshairTeam: "All teams", crosshairSort: "desc" };
  const collectionLoadErrors = new Map();
  let activeSkinPreview = null;
  let activeSkinViewIndex = 0;
  let activeSkinVideoIndex = 0;
  let skinPreviewTouchActivation = null;
  let activeLibraryTransition = null;
  let collectionArchiveRenderToken = 0;
  let featuredPlaylist = null;
  let featuredPlaylistRequest = null;
  let featuredPlaylistStatus = "idle";
  let featuredPlaylistError = "";
  let riotPatchNotes = null;
  let riotPatchNotesRequest = null;
  let riotPatchNotesStatus = "idle";
  let riotPatchNotesError = "";
  let publishedKnowledge = [];
  let publishedKnowledgeRequest = null;
  let overviewRefreshQueued = false;
  let activeMediaPlayer = null;
  let activeMediaPlayerCleanup = null;
  let mediaPlayerSequence = 0;
  let libraryPageActive = false;
  let collageHydrationToken = 0;
  let crosshairCopyResetTimer = 0;
  const PLAYLIST_LIVE_FILTER = "Live";
  const PLAYLIST_AUTOPLAY_STORAGE_PREFIX = "rankedcoach:playlist-autoplay:";
  const topicCollageShuffleSalt = Math.random().toString(36).slice(2);
  const COLLECTION_ARCHIVE_BATCH_SIZE = 24;
  const topicMeta = {
    maps: { label: "Maps", copy: "Attack, defense, role notes, current comps, and marked tactical layouts." },
    agents: { label: "Agents", copy: "Role expectations, ability facts, costs, timing, and repeatable setups." },
    weapons: { label: "Weapons", copy: "Selectable weapon art, damage ranges, economy, and fight decisions." },
    playlist: { label: "Playlist", copy: "Current patch reads and trusted coaching videos, credited to their creators." },
    crosshairs: { label: "Crosshairs", copy: "Pro and community crosshair codes, rendered previews, likes, and saved favorites." }
  };
  const crosshairTabs = Object.freeze(["All", "Top 30 Popular", "Pro's", "Favorites"]);
  const valorantCrosshairColors = Object.freeze({
    "0": "#ffffff",
    "1": "#00ff00",
    "2": "#dfff00",
    "3": "#a6ff00",
    "4": "#ffff00",
    "5": "#00ffff",
    "6": "#ff00ff",
    "7": "#ff0000",
    "8": "#ffffff"
  });
  const vcrdbCrosshairSeeds = Object.freeze([
    { id: "1", name: "The Sun", code: "0;P;c;4;h;0;f;0;0l;2;0a;1;0f;0;1t;4;1l;1;1o;0;1a;1;1m;0;1f;0", tags: "fun", copied: 198702 },
    { id: "2", name: "Sun", code: "0;P;c;3;h;0;d;1;z;6;a;0.538;m;1;0t;10;0l;2;0o;5;0a;0.137;0f;0;1b;0", tags: "fun", copied: 66934 },
    { id: "4", name: "Simple X", code: "0;P;c;4;h;0;d;1;f;0;0t;6;0l;1;0o;1;0a;1;0f;0;1b;0", tags: "", copied: 1069629 },
    { id: "5", name: "Beginner Friendly", code: "0;P;c;1;o;1;d;1;0a;1;0e;0.1;1b;0", tags: "", copied: 110302 },
    { id: "6", name: "Target", code: "0;P;c;1;h;0;d;1;z;1;f;0;0t;5;0l;1;0o;2;0a;1;0f;0;1t;1;1l;1;1o;3;1a;1;1m;0;1f;0", tags: "", copied: 709490 },
    { id: "7", name: "Windmill", code: "0;P;c;1;t;6;o;1;d;1;z;6;a;0;f;0;m;1;0t;10;0l;20;0o;20;0a;1;0m;1;0e;0.1;1t;10;1l;10;1o;40;1a;1;1m;0", tags: "fun", copied: 1384108 },
    { id: "9", name: "Flappy Bird", code: "0;P;c;1;t;3;o;1;f;0;0t;6;0l;20;0o;13;0a;1;0f;0;1t;9;1l;4;1o;9;1a;1;1m;0;1f;0", tags: "fun", copied: 490791 },
    { id: "10", name: "Smiley", code: "0;P;c;7;t;2;o;1;d;1;z;3;a;0;f;0;0t;10;0l;2;0o;2;0a;1;0f;0;1b;0", tags: "fun", copied: 415281 },
    { id: "11", name: "Clown", code: "0;P;c;7;t;2;o;1;d;1;z;3;f;0;0t;10;0l;2;0o;2;0a;1;0f;0;1b;0", tags: "fun", copied: 166274 },
    { id: "12", name: "Wheel", code: "0;P;c;7;o;1;d;1;f;0;0l;4;0o;1;0a;0;0f;0;1t;6;1l;1;1o;3;1a;0;1m;0;1f;0", tags: "fun", copied: 249042 },
    { id: "13", name: "Exclamation", code: "0;P;c;7;t;4;o;1;d;1;z;6;a;0;f;0;0t;6;0l;4;0o;0;0a;1;0f;0;1l;5;1o;0;1a;1;1m;0;1f;0", tags: "fun", copied: 177531 },
    { id: "14", name: "Ornament", code: "0;P;c;7;o;0.8;f;0;0t;5;0l;2;0o;0;0a;1;0f;0;1t;1;1l;1;1o;2;1a;1;1m;0;1f;0", tags: "fun", copied: 425301 },
    { id: "15", name: "Webs", code: "0;P;c;7;h;0;f;0;0l;1;0a;1;0f;0;1t;10;1l;1;1o;1;1a;1;1m;0;1f;0", tags: "fun", copied: 100162 },
    { id: "16", name: "Pokéball", code: "0;P;c;7;o;1;d;1;f;0;0t;10;0l;5;0o;0;0a;1;0f;0;1t;6;1l;1;1o;5;1a;0;1m;0;1f;0", tags: "fun", copied: 297776 },
    { id: "17", name: "Medkit", code: "0;P;c;7;h;0;f;0;0t;6;0l;1;0o;0;0a;1;0f;0;1t;10;1l;1;1o;5;1a;1;1m;0;1f;0", tags: "fun", copied: 151205 },
    { id: "18", name: "Shuriken", code: "0;P;c;7;h;0;f;0;0l;4;0o;2;0a;1;0f;0;1t;8;1l;1;1o;1;1a;1;1m;0;1f;0", tags: "fun", copied: 1048767 },
    { id: "19", name: "Instagram", code: "0;P;c;6;h;0;d;1;z;1;f;0;s;0;0t;4;0l;1;0o;2;0a;1;0f;0;1t;10;1l;1;1o;5;1a;1;1m;0;1f;0", tags: "fun", copied: 217771 },
    { id: "20", name: "Flower 1", code: "0;P;c;6;o;1;d;1;z;4;f;0;m;1;0t;8;0l;3;0o;2;0a;0;0f;0;1l;3;1o;3;1a;0;1m;0;1f;0", tags: "fun", copied: 545160 },
    { id: "21", name: "Hashtag", code: "0;P;h;0;f;0;0b;0;1t;7;1l;1;1o;1;1a;1;1m;0;1f;0", tags: "fun", copied: 147027 },
    { id: "22", name: "Church crosses", code: "0;P;h;0;d;1;z;3;f;0;0t;3;0l;14;0o;6;0a;1;0f;0;1t;9;1l;3;1o;12;1a;1;1m;0;1f;0", tags: "fun", copied: 212935 },
    { id: "23", name: "Windows", code: "0;P;o;1;d;1;z;6;0b;0;1t;6;1l;3;1o;0;1a;0;1m;0;1f;0", tags: "fun", copied: 95347 },
    { id: "24", name: "Burger", code: "0;P;t;2;o;1;d;1;f;0;0t;10;0l;3;0a;1;0f;0;1b;0", tags: "fun", copied: 126093 },
    { id: "25", name: "Star", code: "0;P;h;0;f;0;0l;4;0o;2;0a;1;0f;0;1t;8;1l;1;1o;1;1a;1;1m;0;1f;0", tags: "fun", copied: 688722 },
    { id: "26", name: "TicTacToe", code: "0;P;h;0;f;0;0t;10;0l;1;0o;2;0a;1;0f;0;1b;0", tags: "fun", copied: 114848 },
    { id: "27", name: "Daisy", code: "0;P;h;0;0t;10;0l;3;0o;1;0a;1;0f;0;1b;0", tags: "fun", copied: 144748 },
    { id: "28", name: "Big one", code: "0;P;t;6;o;1;0t;4;0l;1;0o;15;0a;0;0f;0;1t;4;1l;7;1a;0;1m;0;1f;0", tags: "fun", copied: 207114 },
    { id: "29", name: "Mushrooms", code: "0;P;o;1;f;0;0t;4;0l;1;0o;5;0a;0;0f;0;1l;4;1o;3;1a;0;1m;0;1f;0", tags: "fun", copied: 207601 },
    { id: "30", name: "4 Usbs", code: "0;P;o;1;f;0;0t;3;0l;2;0a;1;0f;0;1t;1;1l;5;1o;2;1a;0;1m;0;1f;0", tags: "fun", copied: 255865 },
    { id: "35", name: "Arrows", code: "0;P;h;0;f;0;m;1;0t;4;0l;1;0a;1;0f;0;1l;5;1o;2;1a;1;1m;0;1f;0", tags: "fun", copied: 373048 },
    { id: "36", name: "Snowflake 2", code: "0;P;h;0;f;0;m;1;0l;3;0o;2;0a;1;0f;0;1t;8;1l;1;1o;2;1a;1;1m;0;1f;0", tags: "fun", copied: 186646 },
    { id: "37", name: "Circle", code: "0;P;c;1;h;0;m;1;0l;2;0o;2;0a;1;0f;0;1t;4;1l;1;1o;2;1a;1;1m;0;1f;0", tags: "", copied: 370341 },
    { id: "38", name: "xbox", code: "0;P;c;1;h;0;f;0;m;1;0t;3;0l;3;0o;2;0a;1;0f;0;1t;6;1l;1;1o;4;1a;1;1m;0;1f;0", tags: "fun", copied: 176482 },
    { id: "39", name: "Flower 2", code: "0;P;c;6;h;0;d;1;f;0;0l;3;0a;1;0f;0;1t;4;1o;3;1a;1;1m;0;1f;0", tags: "fun", copied: 229520 },
    { id: "40", name: "Diamond", code: "0;P;c;5;h;0;f;0;0t;1;0l;3;0o;0;0a;1;0f;0;1t;3;1o;0;1a;1;1m;0;1f;0", tags: "fun", copied: 1399656 },
    { id: "41", name: "Plungers", code: "0;P;c;6;t;3;o;0.25;d;1;z;3;a;0.5;f;0;m;1;0t;1;0l;17;0o;20;0a;1;0m;1;1t;9;1l;7;1o;15;1a;0.5;1m;0", tags: "fun", copied: 292950 },
    { id: "42", name: "Snowflake 1", code: "0;P;h;0;f;0;0o;0;0a;1;0f;0;1t;4;1o;2;1a;1;1m;0;1f;0", tags: "fun", copied: 339515 },
    { id: "43", name: "Among Us", code: "0;P;c;5;t;3;o;1;f;0;m;1;0t;4;0l;5;0o;0;0a;1;0f;0;1t;8;1l;3;1o;0;1a;1;1m;0;1f;0", tags: "fun", copied: 278095 },
    { id: "80", name: "Globe", code: "0;P;o;1;f;0;0t;10;0l;4;0a;0;0f;0;1t;4;1o;6;1a;0;1m;0;1f;0", tags: "fun", copied: 202535 },
    { id: "81", name: "Rounded Square", code: "0;P;t;3;o;1;d;1;z;4;f;0;m;1;0l;3;0o;0;0a;1;0f;0;1b;0", tags: "fun", copied: 312487 },
    { id: "82", name: "Black", code: "0;P;c;1;t;2;o;0.75;f;0;m;1;0t;1;0l;4;0o;1;0a;0;0f;0;1b;0", tags: "", copied: 153908 },
    { id: "84", name: "Hollow Circle", code: "0;P;h;0;f;0;0t;4;0l;1;0o;2;0a;1;0f;0;1b;0", tags: "fun", copied: 1688280 },
    { id: "85", name: "Small Dot", code: "0;P;d;1;f;0;0t;4;0l;1;0o;0;0a;1;0f;0;1b;0", tags: "", copied: 7497549 },
    { id: "86", name: "Cloud", code: "0;P;h;0;f;0;0t;9;0l;1;0o;1;0a;1;0f;0;1t;3;1l;1;1o;4;1a;1;1m;0;1f;0", tags: "fun", copied: 177274 },
    { id: "87", name: "fishychair", code: "0;P;c;1;h;0;d;1;f;0;0t;6;0l;1;0o;1;0a;1;0f;0;1b;0", tags: "", copied: 397629 },
    { id: "88", name: "Circle Dot", code: "0;P;c;5;h;0;f;0;0l;2;0o;0;0a;1;0f;0;1b;0", tags: "", copied: 1241125 },
    { id: "89", name: "Reyna Flash", code: "0;P;c;6;t;6;o;0.3;f;0;0t;1;0l;5;0o;5;0a;1;0f;0;1t;10;1l;4;1o;5;1a;0.5;1m;0;1f;0", tags: "fun", copied: 799841 },
    { id: "119", name: "The Throb", code: "0;p;0;s;1;P;c;5;h;0;m;1;0t;4;0l;1;0o;1;0a;1;0m;1;0s;0.04;0e;0.08;1o;2;1a;1;1m;0;1f;0;A;c;5;h;0;d;1;0b;0;1b;0;S;d;0", tags: "fun", copied: 569425 },
    { id: "382", name: "Heart", code: "0;P;c;7;o;0.1;m;1;0t;5;0l;3;0o;1;0a;0.7;0f;0;1t;1;1l;5;1o;0;1a;0.7;1m;0;1f;0", tags: "fun", copied: 180889 },
    { id: "383", name: "Pink Heart", code: "0;P;c;6;o;0.1;m;1;0t;5;0l;3;0o;1;0a;0.7;0f;0;1t;1;1l;5;1o;0;1a;0.7;1m;0;1f;0", tags: "fun", copied: 137169 },
    { id: "384", name: "Big Heart", code: "0;P;c;7;o;0.1;d;1;z;1;a;0;m;1;0t;10;0l;5;0a;1;0f;0;1t;4;1l;10;1o;1;1a;1;1m;0;1f;0", tags: "fun", copied: 133950 },
    { id: "960", name: "Fishnet", code: "0;P;o;1;d;1;a;0;f;0;0t;8;0l;2;0o;5;0a;0;0f;0;1l;8;1o;2;1a;0;1m;0;1f;0", tags: "fun", copied: 133530 },
    { id: "1439", name: "JOLLZTV", code: "0;s;1;P;c;4;o;1;f;0;0t;1;0l;3;0o;1;0a;1;0f;0;1b;0;S;c;0;s;1.08;o;1", tags: "", copied: 143509 },
    { id: "1549", name: "Glasses", code: "0;P;t;2;o;1;d;1;0t;10;0l;19;0v;0;0g;1;0o;1;0a;0;0e;0;1l;10;1v;0;1g;1;1o;19;1a;0;1s;0;1e;0", tags: "fun", copied: 1104113 },
    { id: "1581", name: "Cursor", code: "0;P;h;0;d;1;z;5;0b;0;1t;6;1l;1;1o;1;1a;1;1m;0;1f;0", tags: "fun", copied: 184737 },
    { id: "1582", name: "Candy", code: "0;P;h;0;0t;5;0l;2;0v;0;0g;1;0a;1;0f;0;1t;3;1l;5;1v;1;1g;1;1o;1;1a;1;1m;0;1f;0", tags: "fun", copied: 350034 },
    { id: "1583", name: "Steve", code: "0;P;c;5;t;2;o;1;0t;6;0l;4;0v;3;0g;1;0o;0;0a;1;0f;0;1t;6;1v;6;1g;1;1o;5;1a;1;1m;0;1f;0", tags: "fun", copied: 159505 },
    { id: "1705", name: "Sakura", code: "0;P;c;8;u;F28D9FFF;h;0;d;1;b;1;a;0.254;0t;3;0l;5;0o;0;0a;0.755;0f;0;1t;5;1o;2;1a;1;1m;0;1f;0", tags: "", copied: 734811 },
    { id: "1706", name: "peach", code: "0;c;1;s;1;P;c;8;u;FF6781FF;h;0;b;1;0l;3;0o;2;0a;1;0f;0;1b;0;S;s;0.347;o;1", tags: "", copied: 136678 },
    { id: "1707", name: "Heart when fire", code: "0;P;c;8;u;F97AC0FF;o;0.1;b;1;m;1;0t;5;0l;3;0o;1;0a;0.7;0f;0;1t;1;1l;5;1o;0;1a;0.7;1m;0;1f;0", tags: "", copied: 200264 },
    { id: "1708", name: "Flappy", code: "0;c;1;s;1;P;c;8;u;008000FF;t;3;o;1;b;1;0t;4;0l;0;0v;18;0g;1;0o;10;0a;1;0f;0;1t;10;1l;0;1v;4;1g;1;1o;7;1a;1;1m;0;1f;0", tags: "", copied: 373210 }
  ]);
  const vcrdbImportedCommunitySeeds = Object.freeze([
    { id: "12174", code: "0;s;1;P;h;0;d;1;z;1;m;1;0t;1;0l;4;0v;4;0g;1;0o;0;0a;1;1b;0;S;c;4;o;1" },
    { id: "12173", code: "0;s;1;P;c;5;h;0;0l;2;0o;0;0a;1;0m;1;0f;0;0s;0.03;1b;0;S;c;2;s;0;o;1" },
    { id: "12172", code: "0;P;o;0.654;d;1;0t;4;0l;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12171", code: "0;P;c;8;u;F28D9FFF;h;0;d;1;b;1;a;0.254;0t;3;0l;5;0o;0;0a;0.755;0f;0;1t;5;1o;2;1a;1;1m;0;1f;0" },
    { id: "12170", code: "0;s;1;P;h;0;0t;4;0l;1;0o;1;0a;1;0m;1;0s;0.04;0e;0.08;1o;2;1a;1;1m;0;1f;0;S;c;4;s;0.7;o;1" },
    { id: "12169", code: "0;P;c;8;u;D0021BFF;t;2;o;0.05;d;1;b;1;z;1;0t;7;0l;1;0o;0;0a;0.05;0f;0;1t;1;1l;5;1o;1;1a;0.05;1m;0;1f;0" },
    { id: "12168", code: "0;s;1;P;c;1;o;0.4;f;0;s;0;0b;0;1t;4;1l;1;1o;2;1a;1;1m;0;1f;0;S;c;1" },
    { id: "12167", code: "0;p;0;P;c;8;u;FF8D89FF;o;0.157;d;1;b;1;a;0.484;m;1;0t;4;0l;2;0o;2;0a;1;0e;0.39;1o;3;1a;1;1m;0;1e;0.177" },
    { id: "12166", code: "0;P;c;8;u;000000FF;h;0;b;1;m;1;0l;5;0v;3;0g;1;0o;1;0a;1;0e;0.1;1b;0" },
    { id: "12165", code: "0;s;1;P;c;7;h;0;0l;8;0v;4;0g;1;0o;1;0a;1;0f;0;1b;0;S;o;1" },
    { id: "12164", code: "0;P;c;8;h;0;b;1;0l;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12163", code: "0;P;c;5;o;0.286;d;1;f;0;0t;0;0l;0;0o;0;0a;1;0f;0;1b;0" },
    { id: "12162", code: "0;P;h;0;0t;3;0l;2;0o;0;0a;1;0m;1;0f;0;0s;0.4;1b;0" },
    { id: "12161", code: "0;s;1;P;h;0;f;0;0l;3;0o;0;0f;0;1b;0;S;o;1" },
    { id: "12160", code: "0;c;1;s;1;P;c;8;u;000000FF;h;0;d;1;b;1;z;1;f;0;m;1;0t;1;0l;2;0o;0;0a;1;0m;1;0f;0;0s;0;1b;0;S;c;0;s;1.043;o;1" },
    { id: "12159", code: "0;c;1;s;1;P;o;0;m;1;0t;4;0l;1;0o;1;0a;1;0e;0.111;1o;1;1a;0.629;1m;0;1e;0.111" },
    { id: "12158", code: "0;P;c;1;h;0;0l;4;0v;4;0g;1;0o;2;0a;1;0f;0;1b;0" },
    { id: "12157", code: "0;P;h;0;f;0;m;1;0t;3;0l;0;0v;4;0g;1;0o;1;0a;0.616;0f;0;1t;1;1l;7;1v;3;1g;1;1o;2;1a;1;1m;0;1f;0" },
    { id: "12156", code: "0;P;c;8;u;FFFFFF00;o;1;d;1;b;1;0t;4;0l;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12155", code: "0;P;c;8;d;1;b;1;z;6;a;0;0t;3;0l;20;0v;20;0g;1;0a;0;0m;1;1b;0" },
    { id: "12154", code: "0;s;1;P;h;0;f;0;0t;1;0l;1;0v;1;0g;1;0o;0;0a;1;0f;0;1b;0;S;c;4;o;1" },
    { id: "12153", code: "0;P;o;1;d;1;z;1;f;0;0t;1;0l;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12152", code: "0;s;1;P;c;8;u;000000FF;t;2;o;0;d;1;b;1;z;6;m;1;0l;13;0v;3;0g;1;0o;2;0f;0;1v;0;1g;1;1o;9;1a;1;1f;0;1s;0.2" },
    { id: "12151", code: "0;P;c;1;h;0;d;1;f;0;0g;1;0a;1;0f;0;1b;0" },
    { id: "12150", code: "0;P;o;1;d;1;0l;1;0o;1;0a;1;0f;0;1b;0" },
    { id: "12149", code: "0;s;1;P;d;1;f;0;0b;0;1l;0;1v;3;1g;1;1o;3;1a;0;1m;0;1e;2;S;c;0;s;0.628;o;1" },
    { id: "12148", code: "0;s;1;P;o;1;f;0;0l;5;0o;4;0a;1;0f;0;1b;0;S;c;0;s;0.8;o;1" },
    { id: "12147", code: "0;c;1;s;1;P;c;8;u;957DADFF;h;0;b;1;f;0;m;1;0l;2;0o;0;0a;1;0f;0;1b;0;S;c;5;s;2;o;1" },
    { id: "12146", code: "0;P;o;1;d;1;0l;2;0v;0;0g;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12145", code: "0;P;f;0;0o;2;0a;1;0f;0;1l;0;1o;0;1a;1;1m;0;1f;0" },
    { id: "12144", code: "0;P;c;8;b;1;0t;1;0l;4;0o;1;0a;1;0f;0;1t;3;1o;2;1a;1;1m;0;1f;0" },
    { id: "12143", code: "0;P;c;5;h;0;f;0;0t;1;0l;3;0o;0;0a;1;0f;0;1t;3;1o;0;1a;1;1m;0;1f;0" },
    { id: "12142", code: "0;P;d;1;f;0;0t;4;0l;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12141", code: "0;s;1;P;c;8;u;030303FF;o;1;b;1;f;0;0l;4;0o;2;0a;1;0f;0;1b;0" },
    { id: "12140", code: "0;p;0;s;1;P;c;8;u;000000FF;h;0;b;1;s;0;0l;3;0v;3;0g;1;0o;0;0a;1;0f;0;1b;0;A;d;1;z;1;0b;0;1b;0;S;b;1;c;8;t;000000FF;s;0.86;o;1" },
    { id: "12139", code: "0;s;1;P;c;5;h;0;d;1;0t;6;0l;1;0o;2;0a;1;0f;0;1b;0" },
    { id: "12138", code: "0;P;c;5;d;1;f;0;0t;4;0l;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12137", code: "0;P;c;8;u;4A90E2FF;h;0;b;1;0t;1;0l;4;0v;2;0g;1;0o;2;0a;1;0f;0;1t;3;1v;1;1g;1;1o;3;1a;1;1m;0;1f;0" },
    { id: "12136", code: "0;s;1;P;c;1;o;1;f;0;0l;4;0o;2;0a;1;0f;0;1b;0" },
    { id: "12135", code: "0;p;0;c;1;P;c;8;u;000000FF;h;0;b;1;m;1;0l;4;0o;0;0a;1;0f;0;1b;0" },
    { id: "12134", code: "0;P;c;7;h;0;d;1;z;1;m;1;0l;8;0v;8;0g;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12133", code: "0;p;0;s;1;P;o;0.3;f;0;m;1;0l;2;0o;2;0a;1;0f;0;1b;0;A;c;7;h;0;d;1;z;1;0t;3;0l;2;0o;0;0a;1;0f;0;1b;0;S;s;0" },
    { id: "12132", code: "0;p;0;c;1;s;1;P;c;4;o;0;f;0;m;1;0l;2;0o;1;0a;1;0m;1;1b;0;A;c;8;u;000000FF;o;1;d;1;b;1;z;1;0b;0;1b;0" },
    { id: "12131", code: "0;P;c;7;o;1;d;1;z;1;0t;1;0l;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12130", code: "0;P;h;0;d;1;f;0;0t;10;0l;1;0v;0;0g;1;0o;4;0a;1;0f;0;1l;10;1v;0;1g;1;1o;3;1a;1" },
    { id: "12129", code: "0;P;o;1;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0" },
    { id: "12128", code: "0;p;0;c;1;s;1;P;c;8;u;FEA9FBFF;h;0;b;1;m;1;0t;4;0l;2;0o;1;0a;1;1b;0;A;d;1;0b;0;1b;0" },
    { id: "12127", code: "0;P;o;1;f;0;0l;3;0o;2;0a;1;0f;0;1b;0" },
    { id: "12126", code: "0;P;c;8;u;00FF00FF;h;0;b;1;0l;3;0o;0;0a;1;0f;0;1b;0" },
    { id: "12125", code: "0;c;1;s;1;P;c;8;u;000000FF;t;3;o;0.055;d;1;b;1;z;5;a;0.45;f;0;m;1;0t;3;0l;2;0o;2;0a;0.3;0f;0;1t;1;1l;6;1o;0;1a;1;1m;0;1f;0;S;c;6;s;2.19;o;1" },
    { id: "12124", code: "0;P;c;8;u;FF1900FF;h;0;d;1;b;1;a;0.8;0l;10;0o;5;0a;0.2;0e;0.1;1b;0" },
    { id: "12121", code: "0;P;c;5;h;0;d;1;f;0;0l;4;0o;0;0a;1;0f;0;1b;0" },
    { id: "12120", code: "0;c;1;s;1;P;c;7;o;0;m;1;0t;3;0v;5;0g;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12119", code: "0;p;0;s;1;P;c;8;u;000000FF;h;0;b;1;0l;4;0o;0;0a;1;0f;0;1b;0;A;h;0;0l;4;0o;0;0a;1;0f;0;1b;0" },
    { id: "12118", code: "0;P;c;8;u;003D26FF;h;0;b;1;m;1;0t;8;0l;5;0v;0;0g;1;0o;0;0a;0;0e;2.125;1t;7;1l;3;1o;6;1a;0.734;1m;0;1f;0" },
    { id: "12117", code: "0;s;1;P;c;1;o;1;d;1;z;3;f;0;0t;3;0l;0;0v;3;0g;1;0o;20;0a;1;0f;0;1t;3;1l;0;1v;3;1g;1;1o;40;1a;1;1m;0;1f;0;S;c;0;s;0;o;0" },
    { id: "12116", code: "0;s;1;P;h;0;f;0;m;1;0l;2;0o;1;0a;1;0f;0;1b;0;S;s;2.57;o;0.62" },
    { id: "12115", code: "0;c;1;P;h;0;f;0;0l;5;0o;2;0a;1;0f;0;1b;0" },
    { id: "12114", code: "0;s;1;P;o;1;d;1;f;0;0b;0;1b;0;S;c;0;s;0.8;o;1" },
    { id: "12113", code: "0;s;1;P;c;8;u;FFB6C1FF;h;0;b;1;0t;3;0l;2;0o;0;0a;1;0m;1;0f;0;0s;0.021;1t;1;1l;3;1o;0;1a;1;1f;0;1s;0.021;S;b;1;c;8;t;FFB6C1FF;s;0.75;o;1" },
    { id: "12112", code: "0;s;1;P;c;8;u;0000FFFF;h;0;b;1;0t;8;0l;0;0v;1;0g;1;0o;1;0a;1;0f;0;1v;3;1g;1;1o;1;1a;1;1m;0;1f;0;S;c;0;o;1" },
    { id: "12111", code: "0;P;c;8;u;4B53C3FF;h;0;d;1;b;1;z;3;f;0;m;1;0t;10;0l;0;0v;0;0g;1;0o;1;0a;1;0f;0;1t;1;1o;1;1a;1;1m;0;1f;0" },
    { id: "12110", code: "0;p;0;s;1;P;c;5;h;0;f;0;0l;2;0o;1;0a;1;0f;0;1b;0;A;o;1;d;1;z;1;m;1;0t;1;0l;1;0o;0;0a;1;0f;0;1b;0;S;c;5;o;1" },
    { id: "12109", code: "0;s;1;P;o;1;0t;3;0l;1;0v;0;0g;1;0o;0;0a;1;0f;0;1t;1;1l;4;1g;1;1o;0;1a;1;1m;0;1f;0;S;c;5;s;0.538;o;1" },
    { id: "12108", code: "0;p;0;c;1;s;1;P;c;8;u;C9A2DCFF;h;0;d;1;b;1;z;6;a;0;f;0;m;1;0l;4;0v;3;0g;1;0o;0;0a;1;0f;0;1b;0;A;c;7;h;0;0l;5;0o;1;0a;1;0f;0;1b;0;S;c;5;s;0.7;o;1" },
    { id: "12107", code: "0;s;1;P;c;1;h;0;m;1;0l;2;0o;1;0a;1;0f;0;1b;0;S;c;1;o;1" },
    { id: "12105", code: "0;P;d;1;m;1;0f;0;1l;8;1v;8;1g;1;1o;8;1e;0.732" },
    { id: "12104", code: "0;P;c;8;u;00FF00FF;h;0;d;1;b;1;z;3;a;0.7;0t;1;0l;4;0v;4;0g;1;0o;0;0a;1;0m;1;0f;0;0s;0.023;1t;3;1l;1;1v;1;1g;1;1o;2;1a;1;1f;0;1s;0.02" },
    { id: "12103", code: "0;c;1;s;1;P;t;4;o;1;d;1;z;5;a;0.556;0t;10;0l;20;0v;0;0g;1;0o;13;0a;1;0f;0;1t;1;1l;1;1v;0;1g;1;1o;14;1a;1;1s;0.064;1e;0.375;S;c;3;s;0.628;o;1" },
    { id: "12102", code: "0;p;0;s;1;P;o;1;f;0;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0;A;o;1;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0;S;c;1;o;1" },
    { id: "12101", code: "0;c;1;s;1;P;o;0;m;1;0l;8;0o;0;1a;0;S;s;0;o;1" },
    { id: "12100", code: "0;s;1;P;c;5;o;1;d;1;0l;2;0o;0;0a;1;0m;1;0f;0;1b;0;S;c;5;o;0.6" },
    { id: "12099", code: "0;p;0;s;1;P;c;8;u;36CCF2FF;h;0;b;1;m;1;0l;4;0v;4;0g;1;0o;1;0a;1;0m;1;0s;0.02;0e;0.02;1b;0;A;c;8;u;6AE7F0FF;o;1;d;1;b;1;a;0.82;m;1;0t;3;0l;0;0v;0;0g;1;0o;4;0a;1;0m;1;0s;0.047;0e;0.047;1b;0;S;b;1;c;8;t;00FBFFFF;s;0.58;o;1" },
    { id: "12098", code: "0;P;c;5;o;0.4;m;1;0t;3;0l;2;0o;1;0a;0.541;0f;0;1o;2;1a;0.805;1m;0;1f;0" },
    { id: "12097", code: "0;p;0;s;1;P;c;8;u;36CCF2FF;h;0;b;1;m;1;0v;3;0g;1;0a;1;0m;1;0s;0.073;0e;0.139;1b;0;A;c;8;u;6AE7F0FF;o;1;d;1;b;1;z;3;a;0.82;m;1;0t;3;0l;0;0v;0;0g;1;0o;4;0a;1;0m;1;0s;0.047;0e;0.073;1t;1;1l;9;1v;0;1g;1;1o;4;1a;0.714;1s;0.047;1e;0.073;S;b;1;c;8;t;00FBFFFF;s;0" },
    { id: "12096", code: "0;s;1;P;c;5;h;0;f;0;0l;3;0o;0;0f;0;1b;0;S;o;1" },
    { id: "12095", code: "0;p;0;P;c;7;h;0;0l;4;0o;0;0a;1;0f;0;1b;0" },
    { id: "12094", code: "0;P;c;5;h;0;d;1;z;1;f;0;m;1;0t;1;0l;2;0v;1;0g;1;0o;1;0a;1;0e;0.196;1b;0" },
    { id: "12093", code: "0;P;c;8;o;1;d;1;b;1;z;1;0t;1;0l;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12092", code: "0;s;1;P;c;8;u;FFFF80FF;h;0;d;1;b;1;z;1;f;0;0t;1;0l;15;0v;4;0g;1;0o;2;0a;1;0f;0;1t;6;1l;1;1o;3;1a;1;1m;0;1f;0;S;c;0;s;0.677;o;1" },
    { id: "12091", code: "0;s;1;P;c;6;o;1;f;0;0l;7;0a;1;0f;0;1b;0;S;c;6;s;1.001;o;1" },
    { id: "12090", code: "0;P;c;5;h;0;0l;3;0o;2;0a;1;0f;0;1b;0" },
    { id: "12089", code: "0;c;1;s;1;P;h;0;d;1;a;0.15;f;0;m;1;0t;1;0l;2;0v;2;0g;1;0o;0;0a;1;0m;1;0f;0;0s;0;1b;0;S;s;1.26;o;1" },
    { id: "12088", code: "0;p;0;P;c;4;o;1;d;1;z;6;a;0;m;1;0t;1;0l;1;0v;0;0g;1;0o;11;0a;0;0f;0;1t;6;1l;0;1v;3;1g;1;1o;0;1a;1;1s;0.053;1e;0.149" },
    { id: "12086", code: "0;s;1;P;c;8;u;005AFFFF;o;1;d;1;b;1;0b;0;1b;0;S;d;0" },
    { id: "12085", code: "0;P;c;1;h;0;d;1;z;3;0t;1;0l;1;0o;1;0a;1;0f;0;1b;0" },
    { id: "12084", code: "0;s;1;P;h;0;0l;3;0o;1;0a;1;0f;0;1b;0;S;c;4;s;0.6" },
    { id: "12083", code: "0;s;1;P;c;8;t;5;o;1;d;1;b;1;z;1;0t;5;0l;1;0v;0;0g;1;0o;10;0a;1;0f;0;1t;1;1l;0;1v;0;1g;1;1o;5;1a;0;1m;0;1f;0;S;d;0" },
    { id: "12082", code: "0;p;0;s;1;P;h;0;f;0;m;1;0l;3;0o;2;0a;1;0f;0;1b;0;A;c;1;h;0;d;1;0b;0;1b;0;S;c;1;o;1" },
    { id: "12080", code: "0;s;1;P;o;1;s;0;0t;3;0l;1;0v;0;0g;1;0o;0;0a;1;0f;0;1t;1;1l;4;1g;1;1o;0;1a;1;1m;0;1f;0;S;c;0;o;1" },
    { id: "12079", code: "0;s;1;P;h;0;d;1;m;1;0l;4;0o;1;0a;1;0f;0;1b;0" },
    { id: "12078", code: "0;P;o;0.8;0t;5;0l;1;0o;1;0a;0.4;0f;0;1t;1;1l;1;1o;2;1a;1;1m;0;1f;0" },
    { id: "12076", code: "0;c;1;s;1;P;c;8;u;000000FF;h;0;d;1;b;1;z;3;a;0.6;m;1;0t;1;0l;3;0o;0;0a;0.6;0e;1.006;1t;3;1o;0;1a;0.5;1m;0;1e;1.006;S;b;1;c;8;o;0.3" },
    { id: "12075", code: "0;P;c;8;u;00A3FFFF;o;1;b;1;0t;1;0l;2;0o;0;0a;1;0f;0;1b;0" },
    { id: "12074", code: "0;s;1;P;c;8;u;0079FAFF;o;1;d;1;b;1;f;0;0l;1;0o;0;0a;1;0f;0;1b;0" },
    { id: "12072", code: "0;s;1;P;c;8;u;CBE0AFFF;o;0.83;d;1;b;1;m;1;0b;0;1b;0;S;b;1;c;8;t;CBE0AFFF;s;0.75;o;1" },
    { id: "12071", code: "0;P;c;8;u;9B9B9BFF;h;0;b;1;m;1;0t;1;0v;3;0g;1;0o;2;0a;1;1b;0" },
    { id: "12070", code: "0;P;o;0.245;d;1;0t;8;0l;1;0o;0;0a;1;0f;0;1t;8;1l;1;1o;0;1a;1;1m;0;1f;0" },
    { id: "12069", code: "0;P;h;0;d;1;z;1;a;0.751;0t;1;0l;2;0a;1;0f;0;1t;3;1o;1;1a;0.7;1m;0;1f;0" },
    { id: "12068", code: "0;c;1;P;c;7;d;1;f;0;0t;4;0l;1;0o;0;0a;1;0f;0;1b;0" }
  ]);
  const vcrdbProCrosshairSeeds = Object.freeze([
    { id: "66", name: "yay", code: "0;P;h;0;f;0;0l;4;0o;0;0a;1;0f;0;1b;0", tags: "team", copied: 5718229 },
    { id: "95", name: "Sacy", code: "0;P;h;0;f;0;0t;1;0l;4;0o;1;0a;1;0f;0;1t;3;1o;2;1a;1;1m;0;1f;0", tags: "team", copied: 2948859 },
    { id: "92", name: "LESS", code: "0;P;o;0;f;0;0t;1;0l;2;0o;0;0a;1;0f;0;1b;0", tags: "team", copied: 2291563 },
    { id: "78", name: "ScreaM", code: "0;P;c;5;o;0.286;d;1;f;0;0t;0;0l;0;0o;0;0a;1;0f;0;1b;0", tags: "team", copied: 2023410 },
    { id: "103", name: "Dep", code: "0;s;1;P;o;0.1;f;0;s;0;0t;1;0l;2;0o;1;0a;1;0f;0;1b;0", tags: "team", copied: 2005272 },
    { id: "91", name: "Aspas", code: "0;P;c;5;o;1;d;1;z;3;f;0;0b;0;1b;0", tags: "team", copied: 1858413 },
    { id: "463", name: "Tarik", code: "0;P;o;1;d;1;0b;0;1b;0", tags: "team", copied: 1692648 },
    { id: "74", name: "Cryo", code: "0;P;c;5;h;0;f;0;0l;3;0o;2;0a;1;0f;0;1b;0", tags: "team", copied: 1345627 },
    { id: "72", name: "cNed", code: "0;P;h;0;f;0;0l;5;0o;0;0a;1;0f;0;1b;0", tags: "team", copied: 1333486 },
    { id: "405", name: "BONECOLD", code: "0;P;c;1;h;0;f;0;0l;2;0o;1;0a;1;0f;0;1b;0", tags: "team", copied: 1175705 },
    { id: "71", name: "Sinatraa", code: "0;P;c;5;o;1;f;0;0t;1;0l;3;0a;1;0f;0;1b;0", tags: "team", copied: 897226 },
    { id: "102", name: "Crow", code: "0;s;1;P;o;1;f;0;0t;1;0l;1;0o;1;0a;1;0f;0;1b;0;S;c;0;s;0.5;o;1", tags: "team", copied: 869404 },
    { id: "56", name: "Derke", code: "0;P;o;1;d;1;f;0;s;0;0t;0;0l;1;0o;0;0a;1;0f;0;1t;0;1l;1;1o;0;1a;1;1m;0;1f;0", tags: "team", copied: 838435 },
    { id: "31", name: "Shroud", code: "0;P;c;4;h;0;f;0;0l;5;0o;0;0a;1;0f;0;1b;0", tags: "team", copied: 784892 },
    { id: "76", name: "nAts", code: "0;P;c;1;o;1;f;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0", tags: "team", copied: 756592 },
    { id: "396", name: "Zombs", code: "0;P;h;0;f;0;0l;3;0o;2;0a;1;0f;0;1b;0", tags: "team", copied: 730888 },
    { id: "105", name: "Tennn", code: "0;P;h;0;0l;4;0o;0;0a;1;0f;0;1b;0", tags: "team", copied: 715062 },
    { id: "113", name: "Jamppi", code: "0;s;1;P;h;0;0t;1;0o;2;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0;S;o;0.502", tags: "team", copied: 712296 },
    { id: "434", name: "Koldamenta", code: "0;P;c;7;h;0;f;0;0l;0;0o;4;0a;1;0f;0;1t;4;1o;1;1a;1;1m;0;1f;0", tags: "team", copied: 711401 },
    { id: "410", name: "Shao", code: "0;P;c;5;h;0;d;1;f;0;0l;4;0o;0;0a;1;0f;0;1b;0", tags: "team", copied: 697626 },
    { id: "44", name: "Asuna", code: "0;P;o;1;0t;1;0l;2;0a;1;0f;0;1b;0", tags: "team", copied: 560395 },
    { id: "443", name: "Lakia", code: "0;P;h;0;0t;5;0l;1;0o;2;0a;1;0f;0;1b;0", tags: "team", copied: 531211 },
    { id: "411", name: "Ardiis", code: "0;P;c;5;h;0;f;0;0t;1;0l;0;0o;0;0a;1;0f;0;1t;1;1o;1;1a;1;1m;0;1f;0", tags: "team", copied: 497611 },
    { id: "111", name: "Soulcas", code: "0;s;1;P;o;1;d;1;z;3;f;0;0b;0;1b;0;S;s;0.762", tags: "team", copied: 478036 },
    { id: "98", name: "JonahP", code: "0;P;c;5;o;1;0t;1;0l;3;0o;1;0a;1;0f;0;1b;0", tags: "team", copied: 419012 },
    { id: "51", name: "BuZz", code: "0;P;c;5;o;1;f;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0", tags: "team", copied: 406365 },
    { id: "460", name: "Kyedae", code: "0;P;c;5;h;0;0l;4;0o;2;0a;1;0f;0;1b;0", tags: "team", copied: 376483 },
    { id: "395", name: "Sheydos", code: "0;P;c;7;t;2;o;1;d;1;f;0;0b;0;1b;0", tags: "team", copied: 360613 },
    { id: "409", name: "ANGE1", code: "0;P;c;7;h;0;f;0;0l;4;0o;0;0a;1;0f;0;1b;0", tags: "team", copied: 355040 },
    { id: "79", name: "LuckeRRR", code: "0;P;c;1;h;0;d;1;a;0.98;0b;0;1b;0", tags: "team", copied: 333208 },
    { id: "68", name: "ShahZaM", code: "0;P;c;1;o;1;f;0;0l;5;0a;0.5;0f;0;1b;0", tags: "team", copied: 311514 },
    { id: "114", name: "Nivera", code: "0;s;1;P;o;1;0t;1;0l;2;0o;2;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;S;c;1;o;0.5", tags: "team", copied: 308949 },
    { id: "115", name: "Nukkye", code: "0;s;1;P;o;1;d;1;f;0;0b;0;1b;0;S;s;0.85;o;1", tags: "team", copied: 305527 },
    { id: "424", name: "Dicey", code: "0;P;c;5;h;0;f;0;0t;1;0l;3;0o;1;0a;1;0f;0;1b;0", tags: "team", copied: 301119 },
    { id: "32", name: "Wardell", code: "0;P;c;5;h;0;f;0;0l;4;0o;2;0a;1;0f;0;1b;0", tags: "team", copied: 294787 },
    { id: "90", name: "Marved", code: "0;P;c;1;h;0;f;0;0l;3;0o;2;0a;1;0f;0;1b;0", tags: "team", copied: 258862 }
  ]);
  const vcrdbProPhotoMap = Object.freeze({
    yay: "https://prosettings.net/wp-content/uploads/yay-220x220-fitcontain-q99-gb283-s1.png",
    sacy: "https://prosettings.net/wp-content/uploads/sacy-220x220-fitcontain-q99-gb283-s1.png",
    less: "https://prosettings.net/wp-content/uploads/less-220x220-fitcontain-q99-gb283-s1.webp",
    scream: "https://prosettings.net/wp-content/uploads/scream-220x220-fitcontain-q99-gb283-s1.webp",
    dep: "https://prosettings.net/wp-content/uploads/dep-220x220-fitcontain-q99-gb283-s1.png",
    aspas: "https://prosettings.net/wp-content/uploads/aspas-220x220-fitcontain-q99-gb283-s1.png",
    tarik: "https://prosettings.net/wp-content/uploads/tarik-1-220x220-fitcontain-q99-gb283-s1.png",
    cryo: "https://prosettings.net/wp-content/uploads/cryo-220x220-fitcontain-q99-gb283-s1.png",
    cned: "https://prosettings.net/wp-content/uploads/cned-220x220-fitcontain-q99-gb283-s1.png",
    bonecold: "https://prosettings.net/wp-content/uploads/bonecold-220x220-fitcontain-q99-gb283-s1.png",
    sinatraa: "https://prosettings.net/wp-content/uploads/sinatraa-220x220-fitcontain-q99-gb283-s1.png",
    crow: "https://prosettings.net/wp-content/uploads/crow-220x220-fitcontain-q99-gb283-s1.png",
    derke: "https://prosettings.net/wp-content/uploads/derke-220x220-fitcontain-q99-gb283-s1.png",
    shroud: "https://prosettings.net/wp-content/uploads/shroud-220x220-fitcontain-q99-gb283-s1.png",
    nats: "https://prosettings.net/wp-content/uploads/nats-1-220x220-fitcontain-q99-gb283-s1.png",
    zombs: "https://prosettings.net/wp-content/uploads/zombs-220x220-fitcontain-q99-gb283-s1.png",
    tennn: "https://prosettings.net/wp-content/uploads/tennn-220x220-fitcontain-q99-gb283-s1.png",
    jamppi: "https://prosettings.net/wp-content/uploads/jamppi-220x220-fitcontain-q99-gb283-s1.png",
    koldamenta: "https://prosettings.net/wp-content/uploads/koldamenta-220x220-fitcontain-q99-gb283-s1.png",
    shao: "https://prosettings.net/wp-content/uploads/shao-220x220-fitcontain-q99-gb283-s1.png",
    asuna: "https://prosettings.net/wp-content/uploads/asuna-2-220x220-fitcontain-q99-gb283-s1.png",
    wardell: "https://prosettings.net/cdn-cgi/image/dpr%3D1%2Cf%3Dauto%2Cfit%3Dcontain%2Cgravity%3Dtop%2Cheight%3D220%2Cq%3D99%2Csharpen%3D1%2Cwidth%3D220/wp-content/uploads/wardell.png",
    lakia: "https://prosettings.net/wp-content/uploads/lakia-220x220-fitcontain-q99-gb283-s1.png",
    ardiis: "https://prosettings.net/wp-content/uploads/ardiis-220x220-fitcontain-q99-gb283-s1.png",
    soulcas: "https://prosettings.net/wp-content/uploads/soulcas-220x220-fitcontain-q99-gb283-s1.png",
    jonahp: "https://prosettings.net/wp-content/uploads/jonahp-220x220-fitcontain-q99-gb283-s1.png",
    marved: "https://prosettings.net/wp-content/uploads/marved-220x220-fitcontain-q99-gb283-s1.png",
    buzz: "https://prosettings.net/wp-content/uploads/buzz-220x220-fitcontain-q99-gb283-s1.png",
    kyedae: "https://prosettings.net/wp-content/uploads/kyedae-220x220-fitcontain-q99-gb283-s1.png",
    sheydos: "https://prosettings.net/wp-content/uploads/sheydos-220x220-fitcontain-q99-gb283-s1.png",
    ange1: "https://prosettings.net/wp-content/uploads/ange1-220x220-fitcontain-q99-gb283-s1.png",
    luckerrr: "https://prosettings.net/wp-content/uploads/luckerrr-220x220-fitcontain-q99-gb283-s1.png",
    shahzam: "https://prosettings.net/wp-content/uploads/shahzam-220x220-fitcontain-q99-gb283-s1.png",
    nivera: "https://prosettings.net/wp-content/uploads/nivera-220x220-fitcontain-q99-gb283-s1.png",
    nukkye: "https://prosettings.net/wp-content/uploads/nukkye-220x220-fitcontain-q99-gb283-s1.png",
    dicey: "https://prosettings.net/wp-content/uploads/dicey-220x220-fitcontain-q99-gb283-s1.png"
  });
  // Team marks mirror the official VALORANT Esports team records. The all-team
  // and free-agent marks are neutral RankedCoach artwork, not organization logos.
  const crosshairTeamBrandMap = Object.freeze({
    "All teams": { logo: "/assets/library/teams/all-teams.svg", label: "All teams" },
    "T1 / Creator": { logo: "/assets/library/teams/t1.png", label: "T1 / Creator" },
    Sentinels: { logo: "/assets/library/teams/sentinels.png", label: "Sentinels" },
    "Paper Rex": { logo: "/assets/library/teams/paper-rex.png", label: "Paper Rex" },
    "EDward Gaming": { logo: "/assets/library/teams/edward-gaming.png", label: "EDward Gaming" },
    "Free agent": { logo: "/assets/library/teams/free-agent.svg", label: "Free agent" }
  });
  const crosshairSeedEntries = Object.freeze([
    {
      id: "tenz-2026-cyan",
      player: "TenZ",
      team: "T1 / Creator",
      type: "Pro",
      libraryRank: 1,
      code: "0;s;1;P;c;5;o;0;f;0;0l;2;0v;2;0g;1;0o;1;0a;1;0f;0;1b;0",
      sourceName: "ProSettings",
      sourceUrl: "https://prosettings.net/players/tenz/",
      photo: "https://prosettings.net/wp-content/uploads/tenz-220x220-fitcontain-q99-gb283-s1.png",
      proSettingsSvg: `<svg class="valorant-crosshair-svg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><rect x="26" y="24" width="2" height="2" fill="#00ffff" fill-opacity="1" /><rect x="25.5" y="23.5" width="3" height="3" fill="none" stroke="#000" stroke-width="1" stroke-opacity="0" /><rect x="22" y="24" width="2" height="2" fill="#00ffff" fill-opacity="1" /><rect x="21.5" y="23.5" width="3" height="3" fill="none" stroke="#000" stroke-width="1" stroke-opacity="0" /><rect x="24" y="26" width="2" height="2" fill="#00ffff" fill-opacity="1" /><rect x="23.5" y="25.5" width="3" height="3" fill="none" stroke="#000" stroke-width="1" stroke-opacity="0" /><rect x="24" y="22" width="2" height="2" fill="#00ffff" fill-opacity="1" /><rect x="23.5" y="21.5" width="3" height="3" fill="none" stroke="#000" stroke-width="1" stroke-opacity="0" /></svg>`,
      tags: ["cyan", "compact", "inner lines"]
    },
    {
      id: "zekken-2026-green-dot",
      player: "zekken",
      team: "Sentinels",
      type: "Pro",
      libraryRank: 2,
      code: "0;s;1;P;c;1;t;2;o;1;d;1;0b;0;1b;0;S;b;1;c;8;s;0.823",
      sourceName: "ProSettings",
      sourceUrl: "https://prosettings.net/players/zekken/",
      photo: "https://prosettings.net/wp-content/uploads/zekken-220x220-fitcontain-q99-gb283-s1.png",
      proSettingsSvg: `<svg class="valorant-crosshair-svg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><rect x="24" y="24" width="2" height="2" fill="#00ff00" fill-opacity="1" /><rect x="23" y="23" width="4" height="4" fill="none" stroke="#000" stroke-width="2" stroke-opacity="1" /></svg>`,
      tags: ["green", "dot", "outline"]
    },
    {
      id: "f0rsaken-2026-white",
      player: "f0rsakeN",
      team: "Paper Rex",
      type: "Pro",
      libraryRank: 3,
      code: "0;p;0;c;1;s;1;P;h;0;f;0;s;0;0l;3;0v;3;0g;1;0o;0;0a;1;0f;0;1b;0;A;o;1;d;1;0b;0;1b;0;S;d;0",
      sourceName: "ProSettings",
      sourceUrl: "https://prosettings.net/players/f0rsaken/",
      photo: "https://prosettings.net/wp-content/uploads/f0rsaken-220x220-fitcontain-q99-gb283-s1.png",
      proSettingsSvg: `<svg class="valorant-crosshair-svg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><rect x="25" y="24" width="3" height="2" fill="#ffffff" fill-opacity="1" /><rect x="22" y="24" width="3" height="2" fill="#ffffff" fill-opacity="1" /><rect x="24" y="25" width="2" height="3" fill="#ffffff" fill-opacity="1" /><rect x="24" y="22" width="2" height="3" fill="#ffffff" fill-opacity="1" /></svg>`,
      tags: ["white", "tight", "inner lines"]
    },
    {
      id: "jinggg-2026-green",
      player: "Jinggg",
      team: "Paper Rex",
      type: "Pro",
      libraryRank: 4,
      code: "0;s;1;P;c;1;o;1;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0;S;c;5",
      sourceName: "PCGamesN",
      sourceUrl: "https://www.pcgamesn.com/valorant/crosshairs-best-codes",
      photo: "https://prosettings.net/wp-content/uploads/jinggg-220x220-fitcontain-q99-gb283-s1.png",
      proSettingsSvg: `<svg class="valorant-crosshair-svg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><rect x="27" y="24" width="3" height="2" fill="#FF99FF" fill-opacity="1" /><rect x="26.5" y="23.5" width="4" height="3" fill="none" stroke="#000" stroke-width="1" stroke-opacity="1" /><rect x="20" y="24" width="3" height="2" fill="#FF99FF" fill-opacity="1" /><rect x="19.5" y="23.5" width="4" height="3" fill="none" stroke="#000" stroke-width="1" stroke-opacity="1" /><rect x="24" y="27" width="2" height="3" fill="#FF99FF" fill-opacity="1" /><rect x="23.5" y="26.5" width="3" height="4" fill="none" stroke="#000" stroke-width="1" stroke-opacity="1" /><rect x="24" y="20" width="2" height="3" fill="#FF99FF" fill-opacity="1" /><rect x="23.5" y="19.5" width="3" height="4" fill="none" stroke="#000" stroke-width="1" stroke-opacity="1" /></svg>`,
      tags: ["green", "short lines", "entry"]
    },
    {
      id: "something-2026-white",
      player: "something",
      team: "Paper Rex",
      type: "Pro",
      libraryRank: 5,
      code: "0;P;o;0.619;d;1;f;0;s;0;0t;1;0l;0;0o;2;0a;1;0f;0;1b;0",
      sourceName: "PCGamesN",
      sourceUrl: "https://www.pcgamesn.com/valorant/crosshairs-best-codes",
      photo: "https://prosettings.net/wp-content/uploads/something-220x220-fitcontain-q99-gb283-s1.png",
      proSettingsSvg: `<svg class="valorant-crosshair-svg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><rect x="26" y="24" width="2" height="2" fill="#ffffff" fill-opacity="1" /><rect x="22" y="24" width="2" height="2" fill="#ffffff" fill-opacity="1" /><rect x="24" y="26" width="2" height="2" fill="#ffffff" fill-opacity="1" /><rect x="24" y="22" width="2" height="2" fill="#ffffff" fill-opacity="1" /></svg>`,
      tags: ["white", "dot", "minimal"]
    },
    {
      id: "zmjjkk-2026-white-dot",
      player: "ZmjjKK",
      team: "EDward Gaming",
      type: "Pro",
      libraryRank: 6,
      code: "0;p;0;s;1;P;c;7;o;1;f;0;s;0;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0;A;o;1;d;1;0b;0;1t;0;S;c;0;s;0.591;o;1",
      sourceName: "PCGamesN",
      sourceUrl: "https://www.pcgamesn.com/valorant/crosshairs-best-codes",
      photo: "https://prosettings.net/wp-content/uploads/zmjjkk-220x220-fitcontain-q99-gb283-s1.png",
      proSettingsSvg: `<svg class="valorant-crosshair-svg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><rect x="26" y="24" width="2" height="2" fill="#ffffff" fill-opacity="0.8" /><rect x="22" y="24" width="2" height="2" fill="#ffffff" fill-opacity="0.8" /><rect x="24" y="26" width="2" height="2" fill="#ffffff" fill-opacity="0.8" /><rect x="24" y="22" width="2" height="2" fill="#ffffff" fill-opacity="0.8" /><rect x="24" y="24" width="2" height="2" fill="#ffffff" fill-opacity="1" /></svg>`,
      tags: ["white", "dot", "operator"]
    },
    ...vcrdbProCrosshairSeeds.map((entry, index) => ({
      id: `vcrdb-pro-${entry.id}`,
      player: entry.name || `VCRDB Pro #${entry.id}`,
      team: "Free agent",
      type: "Pro",
      libraryRank: 7 + index,
      code: entry.code,
      sourceName: "VCRDB",
      sourceUrl: `https://www.vcrdb.net/crosshair/${entry.id}`,
      photo: vcrdbProPhotoMap[assetSlug(entry.name)] || "",
      tags: ["pro/team", `${Number(entry.copied || 0).toLocaleString()} copies`].filter(Boolean),
      copied: entry.copied,
      previewReferenceUrl: "https://op.gg/valorant/crosshairs/editor"
    })),
    ...vcrdbCrosshairSeeds.map((entry, index) => ({
      id: `vcrdb-${entry.id}`,
      player: entry.name || `VCRDB #${entry.id}`,
      team: "VCRDB Community",
      type: "Community",
      libraryRank: 100 + index,
      code: entry.code,
      sourceName: "VCRDB",
      sourceUrl: `https://www.vcrdb.net/crosshair/${entry.id}`,
      photo: "",
      tags: [entry.tags || "community", `${Number(entry.copied || 0).toLocaleString()} copies`].filter(Boolean),
      copied: entry.copied,
      previewReferenceUrl: "https://op.gg/valorant/crosshairs/editor"
    })),
    ...vcrdbImportedCommunitySeeds.map((entry, index) => ({
      id: `vcrdb-import-${entry.id}`,
      player: `VCRDB Community #${entry.id}`,
      team: "VCRDB Community",
      type: "Community",
      libraryRank: 200 + index,
      code: entry.code,
      sourceName: "VCRDB",
      sourceUrl: `https://www.vcrdb.net/crosshair/${entry.id}`,
      photo: "",
      tags: ["community import"],
      copied: 0,
      previewReferenceUrl: "https://op.gg/valorant/crosshairs/editor"
    }))
  ]);
  const crosshairBackendState = {
    loading: false,
    loaded: false,
    unavailable: false,
    status: "",
    likes: new Map(),
    liked: new Set(),
    favorites: new Set(),
    pending: new Set(),
    lastCopiedId: ""
  };
  const CROSSHAIR_BACKEND_FLAG_KEY = "rankedcoach_crosshair_backend_enabled_v1";
  const roleIconMap = Object.freeze({
    controller: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/role_controller.png",
    duelist: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/duelist_role.png",
    initiator: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/initiator_role.png",
    sentinel: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/sentinel_role.png"
  });
  const agentUuids = Object.freeze({
    astra: "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
    breach: "5f8d3a7f-467b-97f3-062c-13acf203c006",
    brimstone: "9f0d8ba9-4140-b941-57d3-a7ad57c6b417",
    chamber: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
    clove: "1dbf2edd-4729-0984-3115-daa5eed44993",
    cypher: "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
    deadlock: "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
    fade: "dade69b4-4f5a-8528-247b-219e5a1facd6",
    gekko: "e370fa57-4757-3604-3648-499e1f642d3f",
    harbor: "95b78ed7-4637-86d9-7e41-71ba8c293152",
    iso: "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
    jett: "add6443a-41bd-e414-f6ad-e58d267f4e95",
    "kay-o": "601dbbe7-43ce-be57-2a40-4abd24953621",
    killjoy: "1e58de9c-4950-5125-93e9-a0aee9f98746",
    miks: "7c8a4701-4de6-9355-b254-e09bc2a34b72",
    neon: "bb2a4828-46eb-8cd1-e765-15848195d751",
    omen: "8e253930-4c05-31dd-1b6c-968525494517",
    phoenix: "eb93336a-449b-9c1b-0a54-a891f7921d69",
    raze: "f94c3b30-42be-e959-889c-5aa313dba261",
    reyna: "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
    sage: "569fdd95-4d10-43ab-ca70-79becc718b46",
    skye: "6f2a04ca-43e0-be17-7f36-b3908627744d",
    sova: "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
    tejo: "b444168c-4e35-8076-db47-ef9bf368f384",
    veto: "92eeef5d-43b5-1d4a-8d03-b3927a09034b",
    viper: "707eab51-4836-f488-046a-cda6bf494859",
    vyse: "efba5359-4016-a1e5-7626-b1ae76895940",
    waylay: "df1cb487-4902-002e-5c17-d28e83e78588",
    yoru: "7f94d92c-4234-0a36-9646-3a87eb8b5c89"
  });
  // These are the deliberately small overview portraits shipped locally. Do
  // not point the overview at a missing thumbnail and then fall back to a
  // 2048px remote portrait during the tab transition.
  const overviewAgentPortraitThumbnailIds = Object.freeze(new Set([
    "cypher", "jett", "omen", "sage", "sova", "viper"
  ]));
  const compAgentRoles = Object.freeze({
    chamber: "sentinel", clove: "controller", cypher: "sentinel", fade: "initiator",
    gekko: "initiator", iso: "duelist", jett: "duelist", "kay-o": "initiator", killjoy: "sentinel",
    neon: "duelist", raze: "duelist", reyna: "duelist", sage: "sentinel",
    skye: "initiator", sova: "initiator", viper: "controller"
  });
  const compRoleOrder = Object.freeze(["controller", "duelist", "initiator", "sentinel"]);
  const CLOSE_ROLE_SWAP_DELTA = 1.5;
  const mapUuids = Object.freeze({
    abyss: "224b0a95-48b9-f703-1bd8-67aca101a61f",
    ascent: "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
    bind: "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
    breeze: "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
    corrode: "1c18ab1f-420d-0d8b-71d0-77ad3c439115",
    fracture: "b529448b-4d60-346e-e89e-00a4c527a405",
    haven: "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
    icebox: "e2ad5c54-4114-a870-9641-8ea21279579a",
    lotus: "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
    pearl: "fd267378-4d1d-484f-ff52-77821ed10dc2",
    split: "d960549e-485c-e861-8d71-aa9d1aed12a2",
    summit: "756da597-416b-c0f2-f47b-afbdf28670bc",
    sunset: "92584fbe-486a-b1b2-9faa-39b0f486b498"
  });
  const canonicalMapNames = Object.freeze([
    "Abyss",
    "Ascent",
    "Bind",
    "Breeze",
    "Corrode",
    "Fracture",
    "Haven",
    "Icebox",
    "Lotus",
    "Pearl",
    "Split",
    "Summit",
    "Sunset"
  ]);
  // V26 Act 4 / Patch 13.00 competitive rotation: Ascent, Breeze, Haven, Lotus, Split, Summit, Sunset are active.
  const canonicalMapSeason = Object.freeze({
    abyss: false,
    bind: false,
    corrode: false,
    fracture: false,
    icebox: false,
    pearl: false
  });
  const canonicalWeaponDetails = Object.freeze({
    classic: { image: "/assets/weapons/classic.png", cost: 0, magazine: 12, fireRate: "6.75 rounds/sec", penetration: "Low", damageRanges: [{ range: "0-30m", head: 78, body: 26, legs: 22 }, { range: "30-50m", head: 66, body: 22, legs: 19 }], focus: "Use controlled taps at range, and use alt-fire only as a close-range movement answer." },
    shorty: { image: "/assets/weapons/shorty.png", cost: 300, magazine: 2, fireRate: "3 rounds/sec", penetration: "Low", damageRanges: [{ range: "0-7m", head: 22, body: 11, legs: 9 }, { range: "7-15m", head: 12, body: 6, legs: 5 }, { range: "15-50m", head: 6, body: 3, legs: 3 }], focus: "Damage is per pellet. Use it as a concealed close-corner answer, then upgrade from the dropped weapon." },
    frenzy: { image: "/assets/weapons/frenzy.png", cost: 450, magazine: 15, fireRate: "10 rounds/sec", penetration: "Low", damageRanges: [{ range: "0-20m", head: 78, body: 26, legs: 22 }, { range: "20-50m", head: 63, body: 21, legs: 18 }], focus: "Treat it like a compact SMG: close distance, control the magazine, and avoid long-range tap races." },
    ghost: { image: "/assets/weapons/ghost.png", cost: 500, magazine: 13, fireRate: "6.75 rounds/sec", penetration: "Medium", damageRanges: [{ range: "0-30m", head: 105, body: 30, legs: 26 }, { range: "30-50m", head: 88, body: 25, legs: 21 }], focus: "Use the clean first shot and quiet profile for disciplined pistol-round picks." },
    sheriff: { image: "/assets/weapons/sheriff.png", cost: 800, magazine: 6, fireRate: "4 rounds/sec", penetration: "High", damageRanges: [{ range: "0-30m", head: 160, body: 55, legs: 47 }, { range: "30-50m", head: 145, body: 50, legs: 43 }], focus: "Protect the 0-30m one-shot headshot range and let recoil settle." },
    stinger: { image: "/assets/weapons/stinger.png", cost: 1100, magazine: 20, fireRate: "16 rounds/sec", penetration: "Low", damageRanges: [{ range: "0-15m", head: 68, body: 27, legs: 23 }, { range: "15-50m", head: 57, body: 23, legs: 19 }], focus: "Commit to close fights or controlled alternate-fire bursts." },
    spectre: { image: "/assets/weapons/spectre.png", cost: 1600, magazine: 30, fireRate: "13.33 rounds/sec", penetration: "Low", damageRanges: [{ range: "0-15m", head: 78, body: 26, legs: 22 }, { range: "15-30m", head: 66, body: 22, legs: 19 }, { range: "30-50m", head: 60, body: 20, legs: 17 }], focus: "Close distance and transfer through multiple targets; long-range rifle duels waste the weapon's mobility advantage." },
    bucky: { image: "/assets/weapons/bucky.png", cost: 850, magazine: 5, fireRate: "1.1 rounds/sec", penetration: "Low", damageRanges: [{ range: "0-8m", head: 34, body: 17, legs: 14 }, { range: "8-12m", head: 26, body: 13, legs: 11 }, { range: "12-50m", head: 18, body: 9, legs: 8 }], focus: "Damage is per pellet. Protect the close-range fight and do not expose the long recovery to a second enemy." },
    judge: { image: "/assets/weapons/judge.png", cost: 1850, magazine: 5, fireRate: "3.5 rounds/sec", penetration: "Low", damageRanges: [{ range: "0-10m", head: 34, body: 17, legs: 14 }, { range: "10-15m", head: 20, body: 10, legs: 9 }, { range: "15-50m", head: 14, body: 7, legs: 6 }], focus: "Damage is per pellet. Own a tight choke and have a route to recover a rifle after the first conversion." },
    bulldog: { image: "/assets/weapons/bulldog.png", cost: 2050, magazine: 24, fireRate: "10 rounds/sec", penetration: "Medium", damageRanges: [{ range: "0-50m", head: 116, body: 35, legs: 30 }], focus: "Use alternate-fire bursts for planned mid-range fights and avoid forcing full-auto recoil at long range." },
    guardian: { image: "/assets/weapons/guardian.png", cost: 2250, magazine: 12, fireRate: "5.25 rounds/sec", penetration: "High", damageRanges: [{ range: "0-50m", head: 195, body: 65, legs: 49 }], focus: "Treat every shot as a resettable single-fire decision; high penetration supports disciplined wallbangs." },
    phantom: { image: "/assets/weapons/phantom.png", cost: 2900, magazine: 30, fireRate: "11 rounds/sec", penetration: "Medium", damageRanges: [{ range: "0-20m", head: 156, body: 39, legs: 33 }, { range: "20-50m", head: 140, body: 35, legs: 30 }], focus: "Higher fire rate and a silenced profile reward close-to-mid fights; respect the long-range headshot falloff." },
    vandal: { image: "/assets/weapons/vandal.png", cost: 2900, magazine: 25, fireRate: "9.75 rounds/sec", penetration: "Medium", damageRanges: [{ range: "0-50m", head: 160, body: 40, legs: 34 }], focus: "No damage falloff. Favor clean taps and short bursts once the first controlled shots are gone." },
    marshal: { image: "/assets/weapons/marshal.png", cost: 950, magazine: 5, fireRate: "1.5 rounds/sec", penetration: "Medium", damageRanges: [{ range: "0-50m", head: 202, body: 101, legs: 86 }], focus: "Use mobility and fast follow-up positioning to punish unarmored buys without overstaying a scoped lane." },
    outlaw: { image: "/assets/weapons/outlaw.png", cost: 2400, magazine: 2, fireRate: "2.75 rounds/sec", penetration: "High", damageRanges: [{ range: "0-50m", head: 238, body: 140, legs: 119 }], focus: "Punish light armor with a body shot and manage the two-round chamber as a paired burst." },
    operator: { image: "/assets/weapons/operator.png", cost: 4700, magazine: 5, fireRate: "0.6 rounds/sec", penetration: "High", damageRanges: [{ range: "0-50m", head: 255, body: 150, legs: 120 }], focus: "Plan the escape before taking the shot. Missing without cover exposes the weapon's slow cycle." },
    ares: { label: "Ares", image: "https://media.valorant-api.com/weapons/55d8a0f4-4274-ca67-fe2c-06ab45efdf58/displayicon.png", cost: 1600, magazine: 50, fireRate: "13 rounds/sec", penetration: "High", damageRanges: [{ range: "0-30m", head: 75, body: 30, legs: 25.5 }, { range: "30-50m", head: 70, body: 28, legs: 23.8 }], focus: "Use sustained fire for smoke spam, wall pressure, and anti-rush holds where the wind-up can work for you." },
    odin: { label: "Odin", image: "https://media.valorant-api.com/weapons/63e6c2b6-4a8e-869c-3d4c-e38355226584/displayicon.png", cost: 3200, magazine: 100, fireRate: "12 rounds/sec", penetration: "High", damageRanges: [{ range: "0-30m", head: 95, body: 38, legs: 32.3 }, { range: "30-50m", head: 77.5, body: 31, legs: 26.35 }], focus: "Use the high penetration and deep magazine to deny predictable paths, break utility, and punish grouped pushes." }
  });

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function assetSlug(value = "") {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function sortPatchHistoryNewestFirst(history = []) {
    return history.map((item, index) => {
      const match = String(item?.patch || "").match(/(\d+)(?:\.(\d+))?/);
      return {
        item,
        index,
        major: match ? Number(match[1]) : -1,
        minor: match ? Number(match[2] || 0) : -1
      };
    }).sort((left, right) => (
      right.major - left.major
      || right.minor - left.minor
      || left.index - right.index
    )).map(entry => entry.item);
  }

  function getAgentIcon(agent = "") {
    const slug = assetSlug(agent);
    const uuid = agentUuids[slug];
    return uuid
      ? `https://media.valorant-api.com/agents/${uuid}/displayicon.png`
      : `/assets/library/agents/${slug}/icon.png`;
  }

  function getAgentFallbackIcon(agent = "") {
    const uuid = agentUuids[assetSlug(agent)];
    return uuid
      ? `https://media.valorant-api.com/agents/${uuid}/displayicon.png`
      : `https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/silhouettes/${assetSlug(agent)}.png`;
  }

  function getAuthoredMaps() {
    return Array.isArray(globalThis.RankedCoachGamesenseMaps) ? globalThis.RankedCoachGamesenseMaps : [];
  }

  function getMapApiArtwork(mapName = "") {
    const uuid = mapUuids[assetSlug(mapName)];
    return uuid ? `https://media.valorant-api.com/maps/${uuid}/splash.png` : "";
  }

  function getMapArtwork(mapName = "") {
    const slug = assetSlug(mapName);
    const local = getAuthoredMaps().find(map => map.id === slug)?.cardImage;
    return local || getMapApiArtwork(mapName);
  }

  // Overview tiles use small local art. The Valorant API splash images are
  // 1920–3840px wide, and decoding thirteen of them as the Library appears
  // blocks touch navigation. Detailed dossiers continue to use getMapArtwork.
  function getOverviewMapThumbnail(map = {}) {
    const id = assetSlug(map?.id || map?.label);
    return id ? `/assets/library/maps/thumbs/${id}.jpg` : "";
  }

  // The overview shows one representative per role, so a card-sized portrait
  // is sufficient here. Full portraits remain available inside Agent dossiers.
  function getOverviewAgentPortraitThumbnail(agent = {}, fallback = "") {
    const id = assetSlug(agent?.id || agent?.label || fallback);
    return overviewAgentPortraitThumbnailIds.has(id)
      ? `/assets/library/agents/${id}/portrait-card.png`
      : "";
  }

  function buildMapShell(label = "") {
    const id = assetSlug(label);
    const reference = globalThis.RankedCoachGamesenseVStatsReference?.maps?.[id];
    const metaComps = Array.isArray(reference?.metaComps) ? reference.metaComps.map(comp => ({
      label: comp.label,
      agents: Array.isArray(comp.agents) ? comp.agents.slice() : [],
      composition: comp.composition
    })) : [];
    return {
      id,
      label,
      cardImage: getMapApiArtwork(label),
      inCompetitivePool: canonicalMapSeason[id] !== false,
      isOverviewShell: !reference,
      metaComp: metaComps[0] ? { ...metaComps[0], patch: reference.source?.patchLabel || "Current" } : { patch: "Current" },
      metaComps,
      highRankPickRates: reference ? { ...reference.highRankPickRates } : {},
      rolePickRates: reference?.rolePickRates?.map(item => ({ ...item })) || [],
      dataStatus: reference ? "verified" : "in-review",
      compSample: reference ? {
        rankLabel: reference.source?.rankLabel || "Ascendant to Radiant",
        patchLabel: reference.source?.patchLabel || "Current",
        currentPatchAgentSelections: reference.sample?.agentSelections || 0,
        combinedAgentSelections: reference.sample?.agentSelections || 0,
        source: reference.source?.provider || "",
        note: "High-rank Competitive selection reference. Map and global pick shares use the same rank window; each role layout is an observed five-agent structure.",
        sourceUrl: reference.source?.agentUrl || ""
      } : null,
      lineupLinks: []
    };
  }

  function getTopicCollageImages(topic = "") {
    if (topic === "maps") {
      return getMaps().map(map => map?.cardImage || getMapArtwork(map?.label)).filter(Boolean);
    }
    return getReference().weapons
      .flatMap(group => Array.isArray(group?.weapons) ? group.weapons : [])
      .map(weapon => weapon?.image)
      .filter(Boolean);
  }

  function getSafeMediaThumbnail(src = "") {
    const normalized = String(src || "").trim();
    if (!normalized || /vod-secure\.twitch\.tv\/_404\/404_processing_/i.test(normalized)) return "";
    return normalized;
  }

  function hashCollageValue(value = "") {
    return String(value || "").split("").reduce((hash, character) => {
      return ((hash << 5) - hash + character.charCodeAt(0)) | 0;
    }, 0);
  }

  function getShuffledCollageItems(items = [], salt = topicCollageShuffleSalt) {
    return [...items].sort((left, right) => {
      return hashCollageValue(`${salt}:${left}`) - hashCollageValue(`${salt}:${right}`);
    });
  }

  function getDeferredCollageImageMarkup(src = "", className = "", options = {}) {
    if (!src) return "";
    const classes = [className, "is-collage-loaded"].filter(Boolean).join(" ");
    const fallbackSrc = String(options?.fallbackSrc || "").trim();
    const loading = options?.loading === "lazy" ? "lazy" : "eager";
    const fetchPriority = options?.fetchPriority === "low"
      ? "low"
      : options?.fetchPriority === "auto"
        ? "auto"
        : "high";
    return `<img${classes ? ` class="${escapeHtml(classes)}"` : ""} src="${escapeHtml(src)}" alt="" loading="${loading}" decoding="async" fetchpriority="${fetchPriority}"${fallbackSrc ? ` data-gamesense-overview-fallback-src="${escapeHtml(fallbackSrc)}"` : ""}>`;
  }

  function waitForCollageIdle(token) {
    return new Promise(resolve => {
      const done = () => resolve(token === collageHydrationToken);
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(done, { timeout: 160 });
      } else {
        window.setTimeout(done, 24);
      }
    });
  }

  function getPendingCollageImages() {
    const groups = [...document.querySelectorAll("#gamesenseLibraryView .gamesense-topic-card")]
      .map(card => [...card.querySelectorAll("img[data-gamesense-collage-src]")]);
    const queue = [];
    while (groups.some(group => group.length)) {
      groups.forEach(group => {
        const image = group.shift();
        if (image) queue.push(image);
      });
    }
    return queue;
  }

  async function decodeCollageImage(target, token) {
    const source = target?.dataset?.gamesenseCollageSrc;
    if (!source) return;
    const preload = new Image();
    preload.decoding = "async";
    preload.fetchPriority = "low";
    preload.src = source;
    try {
      await preload.decode();
    } catch (_error) {
      if (!preload.complete) {
        await new Promise(resolve => {
          preload.addEventListener("load", resolve, { once: true });
          preload.addEventListener("error", resolve, { once: true });
        });
      }
    }
    if (
      token !== collageHydrationToken
      || !libraryPageActive
      || !target.isConnected
      || !preload.naturalWidth
    ) return;
    target.src = source;
    target.removeAttribute("data-gamesense-collage-src");
    window.requestAnimationFrame(() => target.classList.add("is-collage-loaded"));
  }

  async function hydrateTopicCollages(token) {
    const queue = getPendingCollageImages();
    for (const target of queue) {
      if (token !== collageHydrationToken || !libraryPageActive) return;
      if (!await waitForCollageIdle(token)) return;
      await decodeCollageImage(target, token);
    }
  }

  function scheduleTopicCollageHydration() {
    const token = ++collageHydrationToken;
    if (!libraryPageActive) return;
    void hydrateTopicCollages(token);
  }

  function setLibraryPageActive(active = false) {
    const nextActive = Boolean(active);
    if (libraryPageActive === nextActive) {
      if (nextActive) {
        if (overviewRefreshQueued) requestOverviewRefresh();
        hydrateFeaturedPlaylist();
        hydratePublishedKnowledge();
        hydrateRiotPatchNotes();
        scheduleTopicCollageHydration();
      }
      return;
    }
    libraryPageActive = nextActive;
    collageHydrationToken += 1;
    if (libraryPageActive) {
      if (overviewRefreshQueued) requestOverviewRefresh();
      hydrateFeaturedPlaylist();
      hydratePublishedKnowledge();
      hydrateRiotPatchNotes();
      scheduleTopicCollageHydration();
    }
  }

  function isLibraryEntranceActive() {
    return document.body?.classList.contains("daily-entrance-motion-active")
      && document.body?.dataset?.dailyEntrancePage === "library";
  }

  function isLibraryPageCurrent() {
    const root = document.getElementById("page-library");
    if (!root) return false;
    if (document.documentElement.classList.contains("is-mobile-layout")) {
      return root.classList.contains("is-current-page")
        || (root.classList.contains("active") && !document.querySelector(".page.is-current-page"));
    }
    return root.classList.contains("active");
  }

  function requestOverviewRefresh() {
    if (!libraryPageActive || state.topic !== "overview" || !isLibraryPageCurrent()) return false;
    if (isLibraryEntranceActive()) {
      overviewRefreshQueued = true;
      return false;
    }
    overviewRefreshQueued = false;
    render({ direction: "replace" });
    return true;
  }

  function getCrosshairAuthBridge() {
    return globalThis.RankedCoachAuthBridge || null;
  }

  function getCrosshairClient() {
    const client = getCrosshairAuthBridge()?.getClient?.();
    return client?.from ? client : null;
  }

  async function getCrosshairUser() {
    const bridge = getCrosshairAuthBridge();
    return bridge?.getFreshUser ? await bridge.getFreshUser() : bridge?.getUser?.() || null;
  }

  function isCrosshairBackendEnabled() {
    return globalThis.RankedCoachCrosshairBackendEnabled === true
      || globalThis.VIP_SUPABASE_CONFIG?.crosshairBackendEnabled === true
      || localStorage.getItem(CROSSHAIR_BACKEND_FLAG_KEY) === "true";
  }

  function getCrosshairEntry(id = "") {
    return crosshairSeedEntries.find(entry => entry.id === id) || null;
  }

  function getCrosshairLikeCount(id = "") {
    return Number(crosshairBackendState.likes.get(id) || 0);
  }

  function normalizeCrosshairTab(tab = "") {
    return crosshairTabs.includes(tab) ? tab : "All";
  }

  function getCrosshairInitials(name = "") {
    const cleaned = String(name || "").replace(/[^A-Za-z0-9\s]/g, " ").trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (!words.length) return "RC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.slice(0, 2).map(word => word[0]).join("").toUpperCase();
  }

  function renderCrosshairTeamLogo(team = "Free agent") {
    const brand = crosshairTeamBrandMap[team] || crosshairTeamBrandMap["Free agent"];
    return `<img src="${escapeHtml(brand.logo)}" alt="" aria-hidden="true" loading="eager" decoding="async" style="display:block;width:22px;height:22px;max-width:100%;object-fit:contain;">`;
  }

  function parseCrosshairCode(code = "") {
    const sections = { global: {}, P: {}, A: {}, S: {} };
    let target = sections.global;
    const tokens = String(code || "").split(";").map(part => part.trim()).filter(part => part !== "");
    for (let index = tokens[0] === "0" ? 1 : 0; index < tokens.length; index += 1) {
      const key = tokens[index];
      if (key === "P" || key === "A" || key === "S") {
        target = sections[key];
        continue;
      }
      const value = tokens[index + 1];
      if (value === undefined) continue;
      target[key] = value;
      index += 1;
    }
    return { ...sections.global, ...sections.P };
  }

  function readCrosshairNumber(settings = {}, key = "", fallback = 0) {
    const value = Number(settings[key]);
    return Number.isFinite(value) ? value : fallback;
  }

  function getCrosshairColor(settings = {}) {
    const custom = String(settings.u || "").replace(/^#/, "").trim();
    if (/^[0-9a-f]{6,8}$/i.test(custom)) return `#${custom.slice(0, 6)}`;
    return valorantCrosshairColors[String(settings.c ?? "0")] || valorantCrosshairColors["0"];
  }

  function getCrosshairLineSettings(settings = {}, prefix = "0") {
    const defaults = prefix === "0"
      ? { enabled: 1, thickness: 2, length: 6, verticalLength: 6, verticalEnabled: 0, offset: 3, opacity: .8 }
      : { enabled: 1, thickness: 2, length: 2, verticalLength: 2, verticalEnabled: 0, offset: 10, opacity: .35 };
    const enabled = readCrosshairNumber(settings, `${prefix}b`, defaults.enabled) > 0;
    const horizontalLength = enabled ? Math.max(0, readCrosshairNumber(settings, `${prefix}l`, defaults.length)) : 0;
    const useVerticalLength = readCrosshairNumber(settings, `${prefix}g`, defaults.verticalEnabled) > 0;
    const verticalLength = enabled
      ? Math.max(0, useVerticalLength ? readCrosshairNumber(settings, `${prefix}v`, defaults.verticalLength) : horizontalLength)
      : 0;
    const thickness = enabled ? Math.max(0, readCrosshairNumber(settings, `${prefix}t`, defaults.thickness)) : 0;
    const offset = Math.max(0, readCrosshairNumber(settings, `${prefix}o`, defaults.offset));
    const opacity = Math.max(0, Math.min(1, readCrosshairNumber(settings, `${prefix}a`, defaults.opacity)));
    const hidden = !enabled || thickness <= 0 || (horizontalLength <= 0 && verticalLength <= 0);
    return { horizontalLength, verticalLength, thickness, offset, opacity, hidden };
  }

  function renderCrosshairLineSet({ horizontalLength = 0, verticalLength = 0, thickness = 1, offset = 2, opacity = 1, hidden = false } = {}, color = "#ffffff", outline = {}, scale = 2.7) {
    if (hidden || opacity <= 0 || (horizontalLength <= 0 && verticalLength <= 0)) return "";
    const center = 64;
    const horizontal = horizontalLength > 0 ? Math.max(5, horizontalLength * scale) : 0;
    const vertical = verticalLength > 0 ? Math.max(5, verticalLength * scale) : 0;
    const lineThickness = Math.max(1.5, thickness * scale);
    const gap = Math.max(0, offset * scale);
    const halfThickness = lineThickness / 2;
    const safeColor = escapeHtml(color);
    const safeOpacity = Math.max(.08, Math.min(1, opacity));
    const strokeWidth = Math.max(0, Number(outline.width) || 0) * scale;
    const strokeAttrs = strokeWidth > 0
      ? ` stroke="rgba(2,6,23,.92)" stroke-width="${strokeWidth}" stroke-opacity="${Math.max(0, Math.min(1, Number(outline.alpha) || 0))}"`
      : "";
    return `
      ${vertical > 0 ? `<rect x="${center - halfThickness}" y="${center - gap - vertical}" width="${lineThickness}" height="${vertical}" fill="${safeColor}" opacity="${safeOpacity}"${strokeAttrs}></rect>` : ""}
      ${vertical > 0 ? `<rect x="${center - halfThickness}" y="${center + gap}" width="${lineThickness}" height="${vertical}" fill="${safeColor}" opacity="${safeOpacity}"${strokeAttrs}></rect>` : ""}
      ${horizontal > 0 ? `<rect x="${center - gap - horizontal}" y="${center - halfThickness}" width="${horizontal}" height="${lineThickness}" fill="${safeColor}" opacity="${safeOpacity}"${strokeAttrs}></rect>` : ""}
      ${horizontal > 0 ? `<rect x="${center + gap}" y="${center - halfThickness}" width="${horizontal}" height="${lineThickness}" fill="${safeColor}" opacity="${safeOpacity}"${strokeAttrs}></rect>` : ""}`;
  }

  function renderCrosshairPreview(entry = {}) {
    const settings = parseCrosshairCode(entry.code);
    const color = getCrosshairColor(settings);
    const outlineEnabled = readCrosshairNumber(settings, "h", 1) > 0;
    const outline = {
      width: outlineEnabled ? readCrosshairNumber(settings, "t", 1) : 0,
      alpha: outlineEnabled ? readCrosshairNumber(settings, "o", .5) : 0
    };
    const dotOn = readCrosshairNumber(settings, "d", 0) > 0;
    const dotSize = Math.max(1.8, readCrosshairNumber(settings, "z", 2) * 2.7);
    const inner = getCrosshairLineSettings(settings, "0");
    const outer = getCrosshairLineSettings(settings, "1");
    const hasInner = !inner.hidden && (inner.horizontalLength > 0 || inner.verticalLength > 0) && inner.opacity > 0;
    const hasOuter = !outer.hidden && (outer.horizontalLength > 0 || outer.verticalLength > 0) && outer.opacity > 0;
    const dotOpacity = Math.max(.18, readCrosshairNumber(settings, "a", 1));
    const dotX = Math.floor(64 - dotSize / 2);
    const dotY = Math.floor(64 - dotSize / 2);
    const dotStroke = outline.width > 0
      ? ` stroke="rgba(2,6,23,.92)" stroke-width="${Math.max(1, outline.width * 2.1)}" stroke-opacity="${Math.max(0, Math.min(1, outline.alpha))}"`
      : "";
    const dotMarkup = dotOn || (!hasInner && !hasOuter)
      ? `<rect x="${dotX}" y="${dotY}" width="${dotSize}" height="${dotSize}" fill="${escapeHtml(color)}" opacity="${dotOpacity}"${dotStroke}></rect>`
      : "";
    return `
      <svg class="gamesense-crosshair-svg" viewBox="0 0 128 128" role="img" aria-label="${escapeHtml(entry.player)} crosshair preview">
        <defs>
          <filter id="crosshairGlow-${escapeHtml(entry.id)}" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" result="blur"></feGaussianBlur>
            <feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
          </filter>
        </defs>
        <g filter="url(#crosshairGlow-${escapeHtml(entry.id)})">
          ${renderCrosshairLineSet(inner, color, outline)}
          ${dotMarkup}
          ${renderCrosshairLineSet(outer, color, outline)}
        </g>
      </svg>`;
  }

  function renderCrosshairPreviewMarkup(entry = {}) {
    return `<span class="gamesense-crosshair-preview">${entry.proSettingsSvg || renderCrosshairPreview(entry)}</span>`;
  }

  function renderCopyIcon() {
    return `<svg class="gamesense-copy-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="8" y="8" width="10" height="10" rx="2"></rect><rect x="5" y="5" width="10" height="10" rx="2"></rect></svg>`;
  }

  function renderCrosshairPhoto(entry = {}) {
    const initials = getCrosshairInitials(entry.player);
    return `
      <span class="gamesense-crosshair-photo" data-crosshair-initials="${escapeHtml(initials)}">
        ${entry.photo ? `<img src="${escapeHtml(entry.photo)}" alt="${escapeHtml(entry.player)}" loading="lazy" decoding="async" data-crosshair-photo-fallback>` : ""}
        <b aria-hidden="true">${escapeHtml(initials)}</b>
      </span>`;
  }

  function getSortedCrosshairEntries(entries = crosshairSeedEntries) {
    const direction = state.crosshairSort === "asc" ? 1 : -1;
    return [...entries].sort((left, right) => {
      const byLikes = (getCrosshairLikeCount(left.id) - getCrosshairLikeCount(right.id)) * direction;
      if (byLikes) return byLikes;
      const byRank = (Number(left.libraryRank) || 9999) - (Number(right.libraryRank) || 9999);
      if (byRank) return byRank;
      return left.player.localeCompare(right.player);
    });
  }

  function getVisibleCrosshairEntries() {
    const tab = normalizeCrosshairTab(state.crosshairTab);
    if (tab === "Favorites") {
      return getSortedCrosshairEntries(crosshairSeedEntries.filter(entry => crosshairBackendState.favorites.has(entry.id)));
    }
    if (tab === "Pro's") {
      return getSortedCrosshairEntries(crosshairSeedEntries.filter(entry =>
        entry.type === "Pro"
        && (state.crosshairTeam === "All teams" || (entry.team || "Free agent") === state.crosshairTeam)
      ));
    }
    if (tab === "Top 30 Popular") return getSortedCrosshairEntries().slice(0, 30);
    return getSortedCrosshairEntries();
  }

  function renderCrosshairCard(entry = {}) {
    const liked = crosshairBackendState.liked.has(entry.id);
    const favorite = crosshairBackendState.favorites.has(entry.id);
    const pendingLike = crosshairBackendState.pending.has(`crosshair_likes:${entry.id}`);
    const pendingFavorite = crosshairBackendState.pending.has(`crosshair_favorites:${entry.id}`);
    const likes = getCrosshairLikeCount(entry.id);
    const isCommunity = entry.type === "Community";
    const copied = crosshairBackendState.lastCopiedId === entry.id;
    return `
      <article class="gamesense-crosshair-card${isCommunity ? " is-community" : " is-pro"}" data-gamesense-crosshair-card="${escapeHtml(entry.id)}" aria-label="${escapeHtml(entry.player)} crosshair">
        ${isCommunity ? "" : `
          <div class="gamesense-crosshair-player">
            ${renderCrosshairPhoto(entry)}
            <div>
              <span>${escapeHtml(entry.team || "Pro")}</span>
              <strong>${escapeHtml(entry.player)}</strong>
            </div>
          </div>`}
        <div class="gamesense-crosshair-build">
          ${renderCrosshairPreviewMarkup(entry)}
          <div class="gamesense-crosshair-code-box">
            <code>${escapeHtml(entry.code)}</code>
            <button type="button" data-gamesense-crosshair-copy="${escapeHtml(entry.id)}" class="${copied ? "is-copied" : ""}" aria-label="Copy ${escapeHtml(entry.player)} crosshair code">${renderCopyIcon()}</button>
            ${copied ? `<span class="gamesense-crosshair-copy-confirm" role="status">Copied</span>` : ""}
          </div>
        </div>
        <div class="gamesense-crosshair-actions">
          <button type="button" data-gamesense-crosshair-like="${escapeHtml(entry.id)}" class="${liked ? "active" : ""}" aria-pressed="${liked ? "true" : "false"}" ${pendingLike ? "disabled" : ""}>
            <span>Like</span><b>${likes}</b>
          </button>
          <button type="button" data-gamesense-crosshair-favorite="${escapeHtml(entry.id)}" class="gamesense-crosshair-favorite ${favorite ? "active" : ""}" aria-pressed="${favorite ? "true" : "false"}" aria-label="${favorite ? "Remove favorite" : "Save favorite"}" ${pendingFavorite ? "disabled" : ""}>♥</button>
        </div>
      </article>`;
  }

  function renderCrosshairReferences() {
    const references = [
      { label: "ProSettings VALORANT Crosshair Database", url: "https://prosettings.net/tools/valorant-crosshair-database/" },
      { label: "VCRDB Valorant Crosshair Database", url: "https://www.vcrdb.net/" },
      { label: "OP.GG VALORANT Crosshair Editor", url: "https://op.gg/valorant/crosshairs/editor" },
      { label: "PCGamesN VALORANT crosshair code references", url: "https://www.pcgamesn.com/valorant/crosshairs-best-codes" },
      { label: "VALORANT Esports current team records and marks", url: "https://valorantesports.com/en-GB/gpr/2026/current" }
    ];
    return `
      <footer class="gamesense-crosshair-references" aria-label="Crosshair direct references">
        <span>Direct references</span>
        <div>
          ${references.map(ref => `<a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.label)}</a>`).join("")}
        </div>
        <small>Crosshair import strings are public Valorant profile codes. VCRDB entries are selected for visibly distinct previews and OP.GG's editor is the reference path for import-preview verification. Links credit the databases used for seed entries and do not imply endorsement.</small>
      </footer>`;
  }

  function renderCrosshairLibrary() {
    const activeTab = normalizeCrosshairTab(state.crosshairTab);
    const entries = getVisibleCrosshairEntries();
    const favoriteEmpty = activeTab === "Favorites" && !entries.length;
    const gridMode = activeTab === "Pro's" ? "is-pro-tab" : "is-dense-tab";
    const backendNote = crosshairBackendState.unavailable
      ? "Apply the crosshair Supabase tables to turn on shared Likes and saved Favorites."
      : "Likes and Favorites are account-gated so one player can only vote once per crosshair.";
    const proTeams = ["All teams", ...new Set(crosshairSeedEntries
      .filter(entry => entry.type === "Pro")
      .map(entry => entry.team || "Free agent")
      .sort((left, right) => left.localeCompare(right)))];
    return `
      <div class="gamesense-gallery-head gamesense-crosshair-gallery-head">
        <div><strong>Crosshair Library</strong><small>Verified pro and community codes with rendered previews and copy-ready imports.</small></div>
        <button class="gamesense-back" type="button" data-gamesense-back="overview">Back to topics</button>
      </div>
      <section class="gamesense-crosshair-panel">
        <div class="gamesense-crosshair-toolbar">
          <div class="gamesense-crosshair-tabs" role="tablist" aria-label="Crosshair filters">
            ${crosshairTabs.map(tab => `<button type="button" data-gamesense-crosshair-tab="${escapeHtml(tab)}" class="${tab === activeTab ? "active" : ""}" aria-selected="${tab === activeTab}">${escapeHtml(tab)}</button>`).join("")}
          </div>
          <button type="button" class="gamesense-crosshair-sort" data-gamesense-crosshair-sort="${state.crosshairSort === "asc" ? "desc" : "asc"}">Likes ${state.crosshairSort === "asc" ? "↑" : "↓"}</button>
        </div>
        ${activeTab === "Pro's" ? `<div class="gamesense-crosshair-team-tabs" role="tablist" aria-label="Filter pro crosshairs by team">
          ${proTeams.map(team => `<button type="button" data-gamesense-crosshair-team="${escapeHtml(team)}" class="${team === state.crosshairTeam ? "active" : ""}" aria-selected="${team === state.crosshairTeam}"><span aria-hidden="true">${renderCrosshairTeamLogo(team)}</span><b>${escapeHtml(team)}</b></button>`).join("")}
        </div>` : ""}
        <p class="gamesense-crosshair-note">${escapeHtml(crosshairBackendState.status || backendNote)}</p>
        <div class="gamesense-crosshair-grid ${gridMode}">
          ${entries.length
            ? entries.map(renderCrosshairCard).join("")
            : `<p class="gamesense-crosshair-empty">${favoriteEmpty ? "Log in and heart a crosshair to build your saved list." : "No crosshairs match this filter yet."}</p>`}
        </div>
        ${renderCrosshairReferences()}
      </section>`;
  }

  async function hydrateCrosshairState(options = {}) {
    if (crosshairBackendState.loading || (crosshairBackendState.loaded && !options.force)) return;
    const client = getCrosshairClient();
    if (!client) return;
    if (!isCrosshairBackendEnabled()) {
      crosshairBackendState.unavailable = true;
      crosshairBackendState.loaded = true;
      crosshairBackendState.status = "Live Likes and Favorites are waiting on the crosshair account-table migration.";
      if (state.topic === "crosshairs" && !options.silent) render({ direction: "replace" });
      return;
    }
    crosshairBackendState.loading = true;
    try {
      const likeCountResult = await client.rpc("get_crosshair_like_counts");
      if (likeCountResult.error) {
        crosshairBackendState.unavailable = true;
        crosshairBackendState.loaded = true;
        crosshairBackendState.status = "Crosshair Likes and Favorites are waiting on the new Supabase tables.";
        return;
      }
      const likeCounts = new Map((likeCountResult.data || []).map(row => [
        String(row?.crosshair_id || ""),
        Number(row?.like_count || 0)
      ]).filter(([id]) => Boolean(id)));
      const user = await getCrosshairUser();
      let liked = new Set();
      let favorites = new Set();
      if (user?.id) {
        const [ownLikes, ownFavorites] = await Promise.all([
          client.from("crosshair_likes").select("crosshair_id").eq("user_id", user.id),
          client.from("crosshair_favorites").select("crosshair_id").eq("user_id", user.id)
        ]);
        if (ownLikes.error || ownFavorites.error) {
          crosshairBackendState.unavailable = true;
          crosshairBackendState.loaded = true;
          crosshairBackendState.status = "Crosshair Likes and Favorites could not be loaded. Try again in a moment.";
          return;
        }
        if (!ownLikes.error) liked = new Set((ownLikes.data || []).map(row => String(row?.crosshair_id || "")).filter(Boolean));
        if (!ownFavorites.error) favorites = new Set((ownFavorites.data || []).map(row => String(row?.crosshair_id || "")).filter(Boolean));
      }
      crosshairBackendState.likes = likeCounts;
      crosshairBackendState.liked = liked;
      crosshairBackendState.favorites = favorites;
      crosshairBackendState.unavailable = false;
      crosshairBackendState.loaded = true;
      crosshairBackendState.status = "";
    } catch (_error) {
      crosshairBackendState.unavailable = true;
      crosshairBackendState.loaded = true;
      crosshairBackendState.status = "Crosshair Likes and Favorites are waiting on the new Supabase tables.";
    } finally {
      crosshairBackendState.loading = false;
      if (state.topic === "crosshairs" && !options.silent) render({ direction: "replace" });
    }
  }

  async function promptForCrosshairAuth(action = "save crosshairs") {
    const user = await getCrosshairUser();
    if (user?.id) return user;
    getCrosshairAuthBridge()?.promptSignIn?.(`Sign in to ${action}.`);
    crosshairBackendState.status = `Sign in to ${action}.`;
    render({ direction: "replace" });
    return null;
  }

  async function toggleCrosshairRelation(table = "", id = "", actionLabel = "save crosshairs") {
    const entry = getCrosshairEntry(id);
    if (!entry || !table) return;
    if (!isCrosshairBackendEnabled()) {
      crosshairBackendState.unavailable = true;
      crosshairBackendState.status = "Live Likes and Favorites are waiting on the crosshair account-table migration.";
      render({ direction: "replace" });
      return;
    }
    const user = await promptForCrosshairAuth(actionLabel);
    if (!user?.id) return;
    const client = getCrosshairClient();
    if (!client) {
      crosshairBackendState.unavailable = true;
      crosshairBackendState.status = "RankedCoach account storage is still connecting. Try again in a moment.";
      render({ direction: "replace" });
      return;
    }
    const isLike = table === "crosshair_likes";
    const targetSet = isLike ? crosshairBackendState.liked : crosshairBackendState.favorites;
    const actionKey = `${table}:${id}`;
    if (crosshairBackendState.pending.has(actionKey)) return;
    crosshairBackendState.pending.add(actionKey);
    try {
      const exists = targetSet.has(id);
      const result = exists
        ? await client.from(table).delete().eq("user_id", user.id).eq("crosshair_id", id)
        : await client.from(table).insert({ user_id: user.id, crosshair_id: id });
      if (result.error && result.error.code !== "23505") {
        crosshairBackendState.unavailable = true;
        crosshairBackendState.status = "Crosshair Likes and Favorites are waiting on the new Supabase tables.";
        return;
      }
      await hydrateCrosshairState({ force: true, silent: true });
      crosshairBackendState.status = exists
        ? `${entry.player} ${isLike ? "Like" : "Favorite"} removed.`
        : `${entry.player} ${isLike ? "Like" : "Favorite"} saved.`;
    } catch (_error) {
      crosshairBackendState.unavailable = true;
      crosshairBackendState.status = "Crosshair Likes and Favorites are waiting on the new Supabase tables.";
    } finally {
      crosshairBackendState.pending.delete(actionKey);
      render({ direction: "replace" });
    }
  }

  function copyCrosshairCode(id = "") {
    const entry = getCrosshairEntry(id);
    if (!entry) return;
    const markCopied = () => {
      crosshairBackendState.lastCopiedId = entry.id;
      crosshairBackendState.status = `${entry.player} crosshair code copied.`;
      render({ direction: "replace" });
      clearTimeout(crosshairCopyResetTimer);
      crosshairCopyResetTimer = setTimeout(() => {
        if (crosshairBackendState.lastCopiedId !== entry.id) return;
        crosshairBackendState.lastCopiedId = "";
        if (state.topic === "crosshairs") render({ direction: "replace" });
      }, 2600);
    };
    const write = navigator.clipboard?.writeText
      ? navigator.clipboard.writeText(entry.code)
      : Promise.reject(new Error("Clipboard unavailable"));
    write
      .then(markCopied)
      .catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = entry.code;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-999px";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand?.("copy");
        textarea.remove();
        if (copied) markCopied();
        else {
          crosshairBackendState.status = "Copy failed. Select the code text manually.";
          render({ direction: "replace" });
        }
      });
  }

  function getTopicCollageMarkup(topic = "") {
    if (topic === "crosshairs") {
      return crosshairSeedEntries.filter(entry => entry.type === "Community").slice(0, 20).map(entry => `
        <span class="gamesense-topic-crosshair-sample">
          ${renderCrosshairPreviewMarkup(entry)}
        </span>`).join("");
    }
    if (topic === "weapons") {
      return getShuffledCollageItems(getTopicCollageImages(topic)).slice(0, 20)
        .map(src => getDeferredCollageImageMarkup(src))
        .join("");
    }
    if (topic === "playlist") {
      return (featuredPlaylist?.items || [])
        .map(video => getSafeMediaThumbnail(video.thumbnail))
        .filter(Boolean)
        .slice(0, 4)
        .map(src => getDeferredCollageImageMarkup(src))
        .join("");
    }
    if (topic === "agents") {
      const agents = getReference().agents || [];
      const rolePicks = [
        { role: "duelist", fallback: "jett" },
        { role: "controller", fallback: "omen" },
        { role: "initiator", fallback: "sova" },
        { role: "sentinel", fallback: "cypher" }
      ].map(({ role, fallback }) => {
        const agent = agents.find(item => (
          assetSlug(item?.role) === role
          && overviewAgentPortraitThumbnailIds.has(assetSlug(item?.id || item?.label))
        )) || agents.find(item => item?.id === fallback) || { id: fallback, label: fallback, portrait: `/assets/library/agents/${fallback}/portrait.png` };
        const thumbnail = getOverviewAgentPortraitThumbnail(agent, fallback);
        const fullPortrait = agent.portrait || getAgentFallbackIcon(agent.label || fallback);
        return `
          <span class="gamesense-topic-role-agent role-${escapeHtml(role)}">
            <img class="gamesense-topic-role-icon" src="${escapeHtml(roleIconMap[role])}" alt="" loading="eager" decoding="async" fetchpriority="high">
            ${getDeferredCollageImageMarkup(thumbnail || fullPortrait, "gamesense-topic-agent-art", {
              fallbackSrc: thumbnail ? fullPortrait : ""
            })}
          </span>`;
      });
      return rolePicks.join("");
    }
    if (topic === "maps") {
      return getMaps().map((map, index) => {
        const fullArtwork = map?.cardImage || getMapArtwork(map?.label);
        const thumbnail = getOverviewMapThumbnail(map);
        return getDeferredCollageImageMarkup(thumbnail || fullArtwork, index === 12 ? "gamesense-topic-collage-wide" : "", {
          fallbackSrc: thumbnail ? fullArtwork : ""
        });
      }).join("");
    }
    return getTopicCollageImages(topic)
      .map(src => getDeferredCollageImageMarkup(src))
      .join("");
  }

  function getCompAgentPickRate(map, agent = "") {
    const rate = Number(map?.highRankPickRates?.[agent]);
    return Number.isFinite(rate) ? rate : null;
  }

  function getCompRoleSignature(comp = {}) {
    const counts = new Map(compRoleOrder.map(role => [role, 0]));
    (comp.agents || []).forEach(agent => {
      const role = compAgentRoles[assetSlug(agent)];
      if (counts.has(role)) counts.set(role, counts.get(role) + 1);
    });
    return compRoleOrder.map(role => `${role}:${counts.get(role)}`).join("|");
  }

  function areCompRoleSwapsClose(map, reference = {}, candidate = {}) {
    let hasSwap = false;
    for (const role of compRoleOrder) {
      const referenceAgents = (reference.agents || []).filter(agent => compAgentRoles[assetSlug(agent)] === role);
      const candidateAgents = (candidate.agents || []).filter(agent => compAgentRoles[assetSlug(agent)] === role);
      if (referenceAgents.length !== candidateAgents.length) return false;
      const removed = referenceAgents.filter(agent => !candidateAgents.includes(agent));
      const added = candidateAgents.filter(agent => !referenceAgents.includes(agent));
      if (!removed.length && !added.length) continue;
      if (removed.length !== added.length) return false;
      hasSwap = true;
      const removedRates = removed.map(agent => getCompAgentPickRate(map, agent)).sort((left, right) => right - left);
      const addedRates = added.map(agent => getCompAgentPickRate(map, agent)).sort((left, right) => right - left);
      if (removedRates.some(rate => rate === null) || addedRates.some(rate => rate === null)) return false;
      if (removedRates.some((rate, index) => Math.abs(rate - addedRates[index]) > CLOSE_ROLE_SWAP_DELTA)) return false;
    }
    return hasSwap;
  }

  function getCompRoleLayoutReferences(map, comps = []) {
    const references = [];
    const bySignature = new Map();
    comps.filter(comp => Array.isArray(comp?.agents) && comp.agents.length === 5).forEach(comp => {
      const signature = getCompRoleSignature(comp);
      const matching = bySignature.get(signature) || [];
      if (!matching.length || matching.some(reference => areCompRoleSwapsClose(map, reference, comp))) {
        references.push(comp);
        matching.push(comp);
        bySignature.set(signature, matching);
      }
    });
    return references.slice(0, 3);
  }

  function getCompRoleTotals(comp = {}) {
    return compRoleOrder.map(role => {
      const agents = (comp.agents || []).filter(agent => compAgentRoles[assetSlug(agent)] === role);
      return {
        role,
        count: agents.length
      };
    }).filter(item => item.count > 0);
  }

  function getMaps() {
    const authored = getAuthoredMaps();
    const byId = new Map(authored.map(map => [map.id || assetSlug(map.label), map]));
    return canonicalMapNames.map(label => {
      const id = assetSlug(label);
      const map = byId.get(id) || buildMapShell(label);
      return canonicalMapSeason[id] === false && map.inCompetitivePool !== false
        ? { ...map, inCompetitivePool: false }
        : map;
    });
  }

  function getReference() {
    return getCompleteReference(globalThis.RankedCoachGamesenseReference || { agents: [], weapons: [], warmupDetails: {} });
  }

  function hasCompleteDamageRanges(ranges = []) {
    return Array.isArray(ranges) && ranges.length && ranges.every(range => (
      range
      && String(range.range || "").trim()
      && Number.isFinite(Number(range.head))
      && Number.isFinite(Number(range.body))
      && Number.isFinite(Number(range.legs))
    ));
  }

  function completeWeapon(weapon = {}, fallbackId = "") {
    const id = assetSlug(weapon.id || fallbackId || weapon.label);
    const canonical = canonicalWeaponDetails[id] || {};
    return {
      ...canonical,
      ...weapon,
      id,
      label: weapon.label || canonical.label || id.replace(/-/g, " "),
      image: weapon.image || canonical.image || "",
      damageRanges: hasCompleteDamageRanges(weapon.damageRanges) ? weapon.damageRanges : canonical.damageRanges || []
    };
  }

  function getCompleteReference(reference = {}) {
    const sourceGroups = Array.isArray(reference.weapons) ? reference.weapons : [];
    const seenWeaponIds = new Set();
    const groups = sourceGroups.map(group => {
      const weapons = (Array.isArray(group.weapons) ? group.weapons : [])
        .map((weapon, index) => completeWeapon(weapon, group.weaponIds?.[index]))
        .filter(weapon => weapon.id);
      weapons.forEach(weapon => seenWeaponIds.add(weapon.id));
      return { ...group, weapons };
    });
    const machineGunWeapons = ["ares", "odin"]
      .filter(id => !seenWeaponIds.has(id))
      .map(id => completeWeapon({ id }, id));
    if (machineGunWeapons.length) {
      const insertAt = Math.max(0, groups.findIndex(group => group.id === "snipers"));
      groups.splice(insertAt + 1, 0, {
        id: "machine-guns",
        label: "Machine Guns",
        examples: "Ares, Odin",
        range: "Sustained wall pressure",
        weaponIds: machineGunWeapons.map(weapon => weapon.id),
        weapons: machineGunWeapons
      });
    }
    return { ...reference, weapons: groups };
  }

  function getWeaponCollectionProvider() {
    const provider = globalThis.RankedCoachWeaponCollections;
    return provider && typeof provider.getCached === "function" && typeof provider.loadForWeapon === "function" ? provider : null;
  }

  function getTopicItems(topic) {
    if (topic === "maps") return getMaps();
    return Array.isArray(getReference()[topic]) ? getReference()[topic] : [];
  }

  function renderPublishedKnowledge(category = "general", entity = "", options = {}) {
    const normalizedEntity = String(entity || "").trim().toLowerCase();
    const includeGeneral = options.includeGeneral !== false;
    const items = publishedKnowledge.filter(item => (
      (includeGeneral && item.category === "general")
      || (item.category === category && String(item.entity || "").trim().toLowerCase() === normalizedEntity)
      || (item.category === "agent-map" && String(item.entity || "").split("\u00b7").map(value => value.trim().toLowerCase()).includes(normalizedEntity))
    ));
    if (!items.length) return "";
    return `
      <section class="gamesense-knowledge-updates">
        <div class="gamesense-section-heading"><span>RankedCoach Research</span></div>
        <div class="gamesense-knowledge-update-grid">${items.map(item => `
          <article>
            <span>${escapeHtml(item.topic || "Coaching principle")}</span>
            <p>${escapeHtml(item.wording)}</p>
            <div>${(item.evidence || []).slice(0, 4).map((evidence, index) => `
              <a href="${escapeHtml(evidence.url)}" target="_blank" rel="noopener noreferrer">Video evidence ${index + 1} · ${Math.floor(Number(evidence.startSeconds || 0) / 60)}:${String(Math.floor(Number(evidence.startSeconds || 0) % 60)).padStart(2, "0")}</a>
            `).join("")}</div>
          </article>
        `).join("")}</div>
      </section>`;
  }

  function hydratePublishedKnowledge(options = {}) {
    if (publishedKnowledgeRequest && !options.force) return publishedKnowledgeRequest;
    publishedKnowledgeRequest = fetch("/api/content/knowledge", {
      headers: { Accept: "application/json" },
      cache: options.force ? "reload" : "default"
    })
      .then(response => {
        if (!response.ok) throw new Error(`Knowledge updates returned ${response.status}`);
        return response.json();
      })
      .then(payload => {
        publishedKnowledge = Array.isArray(payload?.items) ? payload.items : [];
        window.dispatchEvent(new CustomEvent("rankedcoach:published-knowledge-ready"));
        // Background research must not replace an actively opened dossier:
        // a replacement here detaches a player's map/agent controls mid-tap.
        // The overview can safely refresh its general feed; entity-specific
        // research is picked up on the next intentional dossier selection.
        requestOverviewRefresh();
        return publishedKnowledge;
      })
      .catch(error => {
        console.warn("Published coaching updates refresh skipped", error?.message || error);
        publishedKnowledge = [];
        return publishedKnowledge;
      })
      .finally(() => { publishedKnowledgeRequest = null; });
    return publishedKnowledgeRequest;
  }

  function formatPatchDate(value = "") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Effective date pending";
    try {
      return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
    } catch {
      return date.toISOString().slice(0, 10);
    }
  }

  function renderLatestPatchNotes() {
    if (riotPatchNotesStatus === "loading" && !riotPatchNotes) {
      return `
        <section class="gamesense-patch-notes-feed is-loading" aria-live="polite">
          <div class="gamesense-section-heading"><span>Latest Riot Patch Notes</span><strong>Checking official update feed</strong></div>
          <p>Loading the newest official VALORANT patch breakdown...</p>
        </section>`;
    }
    if (!riotPatchNotes) {
      return `
        <section class="gamesense-patch-notes-feed ${riotPatchNotesStatus === "failed" ? "is-error" : ""}">
          <div class="gamesense-section-heading"><span>Latest Riot Patch Notes</span><strong>${riotPatchNotesStatus === "failed" ? "Feed unavailable" : "Official change feed"}</strong></div>
          <p>${escapeHtml(riotPatchNotesError || "Patch notes will appear here once the official Riot feed finishes loading.")}</p>
        </section>`;
    }
    const bullets = Array.isArray(riotPatchNotes.bullets) ? riotPatchNotes.bullets : [];
    const sections = Array.isArray(riotPatchNotes.sections) ? riotPatchNotes.sections : [];
    return `
      <section class="gamesense-patch-notes-feed">
        <div class="gamesense-section-heading">
          <span>Latest Riot Patch Notes</span>
          <strong>${escapeHtml(riotPatchNotes.title || riotPatchNotes.label || "VALORANT Patch Notes")}</strong>
        </div>
        <div class="gamesense-patch-note-meta">
          <span>${escapeHtml(riotPatchNotes.label || "Current Patch")}</span>
          <span>Effective ${escapeHtml(formatPatchDate(riotPatchNotes.effectiveDate))}</span>
          ${riotPatchNotes.sourceUrl ? `<a href="${escapeHtml(riotPatchNotes.sourceUrl)}" target="_blank" rel="noopener noreferrer">Riot source</a>` : ""}
        </div>
        ${riotPatchNotes.tagline ? `<p>${escapeHtml(riotPatchNotes.tagline)}</p>` : ""}
        <div class="gamesense-patch-note-grid">
          ${(bullets.length ? bullets : sections.slice(0, 4).map(section => `${section.title}: ${section.text}`)).slice(0, 6).map((item, index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <p>${escapeHtml(item)}</p>
            </article>
          `).join("")}
        </div>
      </section>`;
  }

  function hydrateRiotPatchNotes(options = {}) {
    if (riotPatchNotesRequest && !options.force) return riotPatchNotesRequest;
    if (riotPatchNotes && !options.force) return Promise.resolve(riotPatchNotes);
    riotPatchNotesStatus = "loading";
    riotPatchNotesError = "";
    riotPatchNotesRequest = fetch("/api/content/patch-notes", {
      headers: { Accept: "application/json" },
      cache: options.force ? "reload" : "default"
    })
      .then(response => {
        if (!response.ok) throw new Error(`Patch notes returned HTTP ${response.status}.`);
        return response.json();
      })
      .then(payload => {
        riotPatchNotes = payload && (payload.title || payload.label) ? payload : null;
        riotPatchNotesStatus = riotPatchNotes ? "ready" : "failed";
        if (state.topic === "overview") requestOverviewRefresh();
        return riotPatchNotes;
      })
      .catch(error => {
        console.warn("Riot patch notes refresh skipped", error?.message || error);
        riotPatchNotesStatus = "failed";
        riotPatchNotesError = "Latest Riot patch notes could not be reached. Please try again shortly.";
        if (state.topic === "overview") requestOverviewRefresh();
        return null;
      })
      .finally(() => { riotPatchNotesRequest = null; });
    return riotPatchNotesRequest;
  }

  function renderOverview() {
    const season = getReference().season || {};
    return `
      <div class="gamesense-overview">
        <div class="gamesense-season-scope"><span>Active Season</span><strong>${escapeHtml(season.label || "Active Season")} | Patch ${escapeHtml(season.patch || "Current")}</strong><p>Agent, map, and weapon rates on this page use the active competitive season, not historical profile data.</p></div>
        <div class="gamesense-topic-grid">
          ${Object.entries(topicMeta).map(([key, meta], index) => `
            <button class="gamesense-topic-card${key === "playlist" ? " gamesense-playlist-topic-card" : ""}" type="button" data-gamesense-topic="${key}" style="--topic-index:${index}">
              <span class="gamesense-topic-collage" aria-hidden="true">${getTopicCollageMarkup(key)}</span>
              <strong${key === "playlist" ? ` class="gamesense-playlist-title"` : ""}>${escapeHtml(meta.label)}${key === "playlist" ? `<span class="gamesense-playlist-play" aria-hidden="true"></span>` : ""}</strong>
              <small>${escapeHtml(meta.copy)}</small>
              <span class="gamesense-topic-action">Open dossier</span>
            </button>
          `).join("")}
        </div>
        ${renderLatestPatchNotes()}
      </div>`;
  }

  function renderMapCard(item, index) {
    const isOutOfSeason = item.inCompetitivePool === false;
    // Map selector cards never need a 1920–3840px dossier splash. Keeping
    // their visual source at card resolution prevents thirteen image decodes
    // from competing with page navigation; map details deliberately retain
    // `item.cardImage` below as their full-resolution source.
    const fullArtwork = item.cardImage || getMapArtwork(item.label);
    const thumbnailArtwork = getOverviewMapThumbnail(item);
    const cardArtwork = thumbnailArtwork || fullArtwork;
    const fullArtworkFallback = thumbnailArtwork && fullArtwork ? ` data-gamesense-map-card-background-fallback="${escapeHtml(fullArtwork)}" data-gamesense-overview-fallback-src="${escapeHtml(fullArtwork)}"` : "";
    const activeSeasonMarks = isOutOfSeason ? "" : `
      <span class="gamesense-map-side-marks" aria-hidden="true">
        <span class="gamesense-map-side-mark is-attack" title="Attack">
          <svg class="gamesense-attack-swords-icon" viewBox="0 0 32 32"><path d="M16 3 28 16 16 29 4 16 16 3Z"></path><path d="M10 6 26 22M22 22l4 4M20 24l4 4M22 6 6 22M10 22l-4 4M12 24l-4 4M13 13l6 6M19 13l-6 6"></path></svg>
        </span>
        <span class="gamesense-map-side-mark is-defense" title="Defense">
          <svg class="gamesense-defense-shield-icon" viewBox="0 0 32 32"><path d="M16 3 27 7v8c0 7-4.5 11.5-11 14-6.5-2.5-11-7-11-14V7l11-4Z"></path><path class="gamesense-defense-shield-half" d="M16 5.2v21.5C10.5 24.3 7 20.5 7 15V8.5l9-3.3Z"></path><path class="gamesense-defense-shield-split" d="M16 5.2v21.5"></path></svg>
        </span>
      </span>`;
    return `
      <button class="gamesense-entry-card gamesense-map-entry-card${isOutOfSeason ? " is-out-of-season" : ""}" type="button" data-gamesense-item="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.label)}${isOutOfSeason ? ", out of season" : ""}" style="--entry-index:${index};--map-card-image:url('${escapeHtml(cardArtwork)}')">
        ${cardArtwork ? `<img class="gamesense-map-card-preload" src="${escapeHtml(cardArtwork)}" alt="" loading="${index < 8 ? "eager" : "lazy"}" decoding="async" fetchpriority="${index < 8 ? "high" : "auto"}${fullArtworkFallback}>` : ""}
        <span class="gamesense-map-card-shade"></span>
        <span class="gamesense-map-card-frame" aria-hidden="true"></span>
        ${activeSeasonMarks}
        <span class="gamesense-map-card-copy"><strong>${escapeHtml(item.label)}</strong>${isOutOfSeason ? `<small class="gamesense-map-season-status">Out of Season</small>` : ""}</span>
      </button>`;
  }

  function renderAgentCard(item, index) {
    const mapSummary = Array.isArray(item.maps) && item.maps.length ? ` | ${item.maps.join(" / ")}` : "";
    const nameLength = String(item.label || "").length;
    const nameClass = nameLength >= 9 ? " is-very-long-name" : nameLength >= 7 ? " is-long-name" : "";
    const roleTone = assetSlug(item.role);
    return `
      <button class="gamesense-entry-card gamesense-agent-entry-card" type="button" data-gamesense-item="${escapeHtml(item.id)}" data-role-tone="${escapeHtml(roleTone)}" style="--entry-index:${index}">
        <span class="gamesense-entry-index">${String(index + 1).padStart(2, "0")}</span>
        <img src="${escapeHtml(item.portrait)}" alt="" loading="${index < 8 ? "eager" : "lazy"}" decoding="async" fetchpriority="${index < 8 ? "high" : "auto"}">
        <span class="gamesense-entry-copy"><strong class="${nameClass.trim()}">${escapeHtml(item.label)}</strong><small>${escapeHtml(item.role)}${escapeHtml(mapSummary)}</small><span>Inspect abilities</span></span>
      </button>`;
  }

  function renderWeaponCard(item, index) {
    return `
      <button class="gamesense-entry-card gamesense-weapon-entry-card" type="button" data-gamesense-item="${escapeHtml(item.id)}" style="--entry-index:${index}">
        <strong class="gamesense-weapon-entry-title">${escapeHtml(item.label)}</strong>
        <span class="gamesense-weapon-card-art">${(item.weapons || []).slice(0, 3).map(weapon => `<img src="${escapeHtml(weapon.image)}" alt="" loading="${index < 8 ? "eager" : "lazy"}" decoding="async" fetchpriority="${index < 8 ? "high" : "auto"}">`).join("")}</span>
        <span class="gamesense-entry-copy"><small>${escapeHtml(item.examples)} | ${escapeHtml(item.range)}</small><span>Inspect weapons</span></span>
      </button>`;
  }

  function getPlaylistFilters() {
    // Keep the archival view at the end of the horizontally scrollable tab
    // strip. It remains a first-class filter, but no longer interrupts the
    // current-category flow on either desktop or touch layouts.
    return ["All", "Home", "News", PLAYLIST_LIVE_FILTER, "VOD's", "YT Shorts", "General", "Role", "Agent", "Map Knowledge", "Mechanics", "Mentality", "Settings/Gear", "Historical Archive"];
  }

  function normalizePlaylistFilter(value = "") {
    const candidate = String(value || "").trim();
    if (candidate === "Live/Streaming" || candidate === "Live 🔴") return PLAYLIST_LIVE_FILTER;
    return getPlaylistFilters().includes(candidate) ? candidate : "Home";
  }

  function getPlaylistFilterLabel(filter = "") {
    return normalizePlaylistFilter(filter) === PLAYLIST_LIVE_FILTER ? "Live 🔴" : normalizePlaylistFilter(filter);
  }

  function isPlaylistAutoplayCategory(filter = "") {
    return !["Home", "Historical Archive", PLAYLIST_LIVE_FILTER].includes(normalizePlaylistFilter(filter));
  }

  function getPlaylistAutoplayStorageKey(filter = "") {
    const normalized = normalizePlaylistFilter(filter).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return normalized ? `${PLAYLIST_AUTOPLAY_STORAGE_PREFIX}${normalized}` : "";
  }

  function getPlaylistAutoplayEnabled(filter = "") {
    const key = getPlaylistAutoplayStorageKey(filter);
    if (!key || !isPlaylistAutoplayCategory(filter)) return false;
    try {
      return window.localStorage.getItem(key) === "true";
    } catch (_error) {
      return false;
    }
  }

  function setPlaylistAutoplayEnabled(filter = "", enabled = false) {
    const key = getPlaylistAutoplayStorageKey(filter);
    if (!key || !isPlaylistAutoplayCategory(filter)) return false;
    try {
      window.localStorage.setItem(key, enabled ? "true" : "false");
      return true;
    } catch (_error) {
      return false;
    }
  }

  function isPlaylistVod(item = {}) {
    const platform = String(item.platform || "youtube").toLowerCase();
    const sourceType = String(item.sourceType || "").toLowerCase();
    return Boolean(item.isVod)
      || sourceType === "twitch-archive"
      || sourceType === "youtube-vod"
      || (platform === "twitch" && /twitch\.tv\/videos\/\d+/i.test(String(item.url || "")));
  }

  function renderPlaylistHomeIcon() {
    return `<svg class="gamesense-playlist-home-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.2 12 3l9 8.2v9.3h-6.2v-6h-5.6v6H3v-9.3Z"></path></svg>`;
  }

  function renderMediaThumbnail(src = "") {
    const safeSource = getSafeMediaThumbnail(src);
    if (safeSource) return `<img src="${escapeHtml(safeSource)}" alt="" loading="lazy">`;
    return `<span class="gamesense-video-thumb-fallback" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M10 13h44v38H10z"></path><path d="m27 23 16 9-16 9z"></path></svg></span>`;
  }

  function getPlaylistVideoWatchUrl(video = {}) {
    const url = String(video.url || "").trim();
    const startSeconds = Math.max(0, Math.floor(Number(video.startSeconds || 0)));
    if (!url || !startSeconds || !/^(?:https?:)?\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(url)) return url;
    try {
      const watchUrl = new URL(url, window.location.origin);
      watchUrl.searchParams.set("t", `${startSeconds}s`);
      return watchUrl.toString();
    } catch {
      return url;
    }
  }

  function getPlaylistCatalogItems() {
    const seen = new Set();
    return [
      ...(featuredPlaylist?.items || []),
      ...(featuredPlaylist?.historicalItems || [])
    ].filter(video => {
      const platform = String(video?.platform || "youtube").toLowerCase();
      const id = String(video?.upstreamId || video?.id || "").trim();
      const identity = id ? `${platform}:${id}` : "";
      if (!identity || seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
  }

  function getYouTubePlaylistVideoId(video = {}) {
    if (String(video?.platform || "youtube").toLowerCase() !== "youtube") return "";
    const id = String(video?.id || video?.upstreamId || "").trim();
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
  }

  function getPlaylistAutoplayQueue(filter = "") {
    const normalized = normalizePlaylistFilter(filter);
    if (!isPlaylistAutoplayCategory(normalized)) return [];
    const catalog = getPlaylistCatalogItems();
    const matching = normalized === "All"
      ? catalog
      : normalized === "VOD's"
        ? catalog.filter(isPlaylistVod)
        : catalog.filter(video => String(video?.topicType || "") === normalized);
    return matching.filter(video => getYouTubePlaylistVideoId(video));
  }

  function renderPlaylistAutoplayControl(filter = "") {
    const normalized = normalizePlaylistFilter(filter);
    const queue = getPlaylistAutoplayQueue(normalized);
    if (queue.length < 2) return "";
    const enabled = getPlaylistAutoplayEnabled(normalized);
    const status = enabled ? "On" : "Off";
    return `<button class="gamesense-playlist-autoplay${enabled ? " is-active" : ""}" type="button" data-gamesense-playlist-autoplay="${escapeHtml(normalized)}" aria-pressed="${enabled}" aria-label="Autoplay ${escapeHtml(getPlaylistFilterLabel(normalized))}: ${status}. Continue to the next video in this category when a video finishes."><span>Autoplay this category</span><strong>${status}</strong></button>`;
  }

  function normalizePlaylistVideoWatchKey(value = "") {
    const match = String(value || "").trim().match(/^(youtube|twitch):([A-Za-z0-9_-]{1,128})$/i);
    return match ? `${match[1].toLowerCase()}:${match[2]}` : "";
  }

  function getPlaylistVideoWatchKey(video = {}) {
    const platform = String(video?.platform || "youtube").trim().toLowerCase();
    if (platform === "youtube") {
      const id = String(video?.upstreamId || video?.id || "").trim();
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? `youtube:${id}` : "";
    }
    if (platform === "twitch") {
      const id = String(video?.upstreamId || "").trim()
        || String(video?.url || "").match(/twitch\.tv\/videos\/(\d+)/i)?.[1]
        || getTwitchChannel(video);
      return /^[A-Za-z0-9_-]{1,128}$/.test(id) ? `twitch:${id}` : "";
    }
    return "";
  }

  function isPlaylistVideoWatched(video = {}) {
    const watchKey = getPlaylistVideoWatchKey(video);
    return Boolean(watchKey && globalThis.RankedCoachPlaylistWatchHistory?.hasWatched?.(watchKey));
  }

  function renderPlaylistWatchedPill(video = {}) {
    return isPlaylistVideoWatched(video)
      ? `<span class="gamesense-video-watched" aria-label="Watched">Watched</span>`
      : "";
  }

  function formatYouTubeLikeCount(value) {
    const count = Number(value);
    if (!Number.isSafeInteger(count) || count < 0) return "";
    try {
      return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(count);
    } catch {
      return count.toLocaleString();
    }
  }

  function renderYouTubeLikeMetric(video = {}) {
    if (String(video.platform || "youtube").toLowerCase() !== "youtube") return "";
    if (video.youtubeLikeMetricStatus !== "verified") return "";
    const likeCount = formatYouTubeLikeCount(video.youtubeLikeCount);
    return likeCount
      ? `<small class="gamesense-video-youtube-metric" title="Official YouTube like count">${escapeHtml(likeCount)} 👍</small>`
      : "";
  }

  function syncPlaylistWatchedPills() {
    const watchHistory = globalThis.RankedCoachPlaylistWatchHistory;
    document.querySelectorAll(".gamesense-video-card[data-video-watch-key]").forEach(card => {
      const watchKey = normalizePlaylistVideoWatchKey(card.dataset.videoWatchKey || "");
      const watched = Boolean(watchKey && watchHistory?.hasWatched?.(watchKey));
      card.classList.toggle("is-watched", watched);
      const pill = card.querySelector(".gamesense-video-watched");
      if (watched && !pill) {
        card.insertAdjacentHTML("beforeend", `<span class="gamesense-video-watched" aria-label="Watched">Watched</span>`);
      } else if (!watched && pill) {
        pill.remove();
      }
    });
  }

  function renderPlaylistVideoCard(video, options = {}) {
    const isYouTube = String(video.platform || "youtube").toLowerCase() === "youtube";
    const twitchVideoId = String(video.upstreamId || "").trim() || String(video.url || "").match(/twitch\.tv\/videos\/(\d+)/i)?.[1] || "";
    const historical = options.historical === true || video.archiveOnly === true;
    const sourceLabel = historical
      ? "Historical guide"
      : video.isShort
        ? "YouTube Short"
        : String(video.sourceType || "creator-guide").replace(/-/g, " ");
    const displayTopic = isPlaylistVod(video) ? "VOD's" : String(video.topicType || "");
    const targetLabel = String(video.targetName || "").trim();
    const metadata = [targetLabel, displayTopic].filter(Boolean).join(" | ");
    const watchUrl = getPlaylistVideoWatchUrl(video) || String(video.url || "");
    const watchKey = getPlaylistVideoWatchKey(video);
    const watched = isPlaylistVideoWatched(video);
    const thumbAction = isYouTube && /^[A-Za-z0-9_-]{11}$/.test(String(video.id || ""))
      ? `data-gamesense-play-video="${escapeHtml(video.id)}"`
      : /^\d+$/.test(twitchVideoId)
        ? `data-gamesense-play-twitch-video="${escapeHtml(twitchVideoId)}"`
        : `data-gamesense-open-live="${escapeHtml(video.url)}"`;
    const autoplayCategory = options.autoplayCategory && getYouTubePlaylistVideoId(video)
      ? normalizePlaylistFilter(options.autoplayCategory)
      : "";
    return `<article class="gamesense-video-card${historical ? " gamesense-historical-video-card" : ""}${watched ? " is-watched" : ""}" data-video-id="${escapeHtml(video.id)}"${watchKey ? ` data-video-watch-key="${escapeHtml(watchKey)}"` : ""}${autoplayCategory ? ` data-gamesense-playlist-category="${escapeHtml(autoplayCategory)}"` : ""}>
      <button class="gamesense-video-thumb" type="button" ${thumbAction} aria-label="Play ${escapeHtml(video.title)}">${renderMediaThumbnail(video.thumbnail)}<i aria-hidden="true"></i></button>
      <div><span>${escapeHtml(sourceLabel)}</span><h3>${escapeHtml(video.title)}</h3><p>${escapeHtml(video.channel)}${metadata ? ` | ${escapeHtml(metadata)}` : ""}</p>${renderYouTubeLikeMetric(video)}<a href="${escapeHtml(watchUrl)}" target="_blank" rel="noopener noreferrer">${isYouTube ? "Watch &amp; like on YouTube" : "Watch on Twitch"}</a></div>
      ${renderPlaylistWatchedPill(video)}
    </article>`;
  }

  function renderYouTubePlayer(videoId, title = "Featured VALORANT video", options = {}) {
    const origin = window.location.origin;
    const params = new URLSearchParams({
      autoplay: options.autoplay === true ? "1" : "0",
      controls: "1",
      fs: "1",
      playsinline: "1",
      rel: "0",
      origin
    });
    const startSeconds = Math.max(0, Math.floor(Number(options.startSeconds || 0)));
    const playerId = String(options.playerId || "").replace(/[^A-Za-z0-9_-]/g, "");
    if (startSeconds) params.set("start", String(startSeconds));
    if (options.enableJsApi === true) params.set("enablejsapi", "1");
    return `<iframe class="gamesense-video-embed"${playerId ? ` id="${escapeHtml(playerId)}" data-gamesense-youtube-player="true"` : ""} src="https://www.youtube-nocookie.com/embed/${escapeHtml(videoId)}?${escapeHtml(params.toString())}" title="${escapeHtml(title)}" allow="accelerometer; autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }

  function getTwitchChannel(stream = {}) {
    const direct = String(stream.channel || "").trim();
    if (/^[A-Za-z0-9_]{1,25}$/.test(direct)) return direct;
    const match = String(stream.url || "").match(/^https:\/\/(?:www\.)?twitch\.tv\/([A-Za-z0-9_]{1,25})(?:[/?#]|$)/i);
    return match?.[1] || "";
  }

  function renderTwitchPlayer(channel = "", videoId = "") {
    const params = new URLSearchParams({
      parent: window.location.hostname,
      autoplay: "false",
      muted: "false"
    });
    if (videoId) params.set("video", `v${videoId}`);
    else params.set("channel", channel);
    const title = videoId ? "Twitch past broadcast" : `${channel} live on Twitch`;
    return `<iframe class="gamesense-video-embed gamesense-twitch-embed" src="https://player.twitch.tv/?${escapeHtml(params.toString())}" title="${escapeHtml(title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }

  function closeMediaPlayer() {
    activeMediaPlayerCleanup?.();
    activeMediaPlayerCleanup = null;
    if (!activeMediaPlayer) return;
    const overlay = activeMediaPlayer;
    activeMediaPlayer = null;
    overlay.classList.remove("is-open");
    document.body.classList.remove("gamesense-media-open");
    window.setTimeout(() => overlay.remove(), 180);
  }

  function bindYouTubePlaybackWatch(frame, watchKey = "", onEnded = null) {
    const normalizedWatchKey = normalizePlaylistVideoWatchKey(watchKey);
    if (!frame) return () => {};

    let reported = false;
    let hasStarted = false;
    let endedReported = false;
    const postToPlayer = payload => {
      try {
        frame.contentWindow?.postMessage(JSON.stringify({
          ...payload,
          id: frame.id,
          channel: "widget"
        }), "https://www.youtube-nocookie.com");
      } catch (_error) {
        // The modal can be closed before the third-party iframe is ready.
      }
    };
    const subscribe = () => {
      postToPlayer({ event: "listening" });
      postToPlayer({ event: "command", func: "addEventListener", args: ["onStateChange"] });
    };
    const onMessage = event => {
      if (event.source !== frame.contentWindow || !/^https:\/\/www\.youtube(?:-nocookie)?\.com$/i.test(String(event.origin || ""))) return;
      let payload = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (_error) {
          return;
        }
      }
      const state = Number(payload?.info?.playerState ?? payload?.info);
      if (payload?.event !== "onStateChange") return;
      if (payload?.event !== "onStateChange" || state !== 1) {
        if (state === 0 && hasStarted && !endedReported && typeof onEnded === "function") {
          endedReported = true;
          onEnded();
        }
        return;
      }
      hasStarted = true;
      if (!reported && normalizedWatchKey) {
        reported = true;
        globalThis.RankedCoachPlaylistWatchHistory?.markWatched?.(normalizedWatchKey);
      }
    };
    frame.addEventListener("load", subscribe, { once: true });
    window.addEventListener("message", onMessage);
    window.setTimeout(subscribe, 0);
    return () => {
      frame.removeEventListener("load", subscribe);
      window.removeEventListener("message", onMessage);
    };
  }

  function openMediaPlayer({ platform = "youtube", id = "", channel = "", videoId = "", title = "VALORANT video", url = "", startSeconds = 0, sourceLabel = "Featured Video", watchKey = "", autoplay = false, autoplayCategory = "", autoplayQueue = [] } = {}) {
    closeMediaPlayer();
    document.querySelectorAll("#gamesenseMediaOverlay").forEach(overlay => overlay.remove());
    const isTwitch = platform === "twitch";
    const playerId = !isTwitch && normalizePlaylistVideoWatchKey(watchKey)
      ? `gamesense-youtube-player-${++mediaPlayerSequence}`
      : "";
    const player = isTwitch
      ? renderTwitchPlayer(channel, videoId)
      : renderYouTubePlayer(id, title, { startSeconds, enableJsApi: Boolean(playerId), playerId, autoplay });
    const externalLabel = isTwitch ? "Open on Twitch" : "Open & like on YouTube";
    const overlay = document.createElement("div");
    overlay.id = "gamesenseMediaOverlay";
    overlay.className = "gamesense-media-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", title);
    overlay.innerHTML = `
      <section class="gamesense-media-dialog">
        <header>
          <div><span>${isTwitch ? "Live Stream" : escapeHtml(sourceLabel)}</span><strong>${escapeHtml(title)}</strong></div>
          <button type="button" data-gamesense-close-media aria-label="Close video player">Close</button>
        </header>
        <div class="gamesense-media-stage${isTwitch ? " is-twitch" : ""}">${player}</div>
        ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${externalLabel}</a>` : ""}
      </section>`;
    overlay.addEventListener("click", event => {
      if (event.target === overlay || event.target.closest?.("[data-gamesense-close-media]")) closeMediaPlayer();
    });
    document.body.appendChild(overlay);
    document.body.classList.add("gamesense-media-open");
    activeMediaPlayer = overlay;
    if (playerId) {
      activeMediaPlayerCleanup = bindYouTubePlaybackWatch(
        overlay.querySelector("[data-gamesense-youtube-player]"),
        watchKey,
        () => {
          const category = normalizePlaylistFilter(autoplayCategory);
          const queue = Array.isArray(autoplayQueue) ? autoplayQueue : [];
          if (!getPlaylistAutoplayEnabled(category) || queue.length < 2) return;
          const currentIndex = queue.findIndex(video => getYouTubePlaylistVideoId(video) === id);
          const nextVideo = currentIndex >= 0 ? queue[currentIndex + 1] : null;
          if (!nextVideo) return;
          window.setTimeout(() => {
            if (!activeMediaPlayer?.isConnected) return;
            openPlaylistVideo(nextVideo, {
              autoplay: true,
              autoplayCategory: category,
              autoplayQueue: queue
            });
          }, 120);
        }
      );
    }
    window.requestAnimationFrame(() => overlay.classList.add("is-open"));
    overlay.querySelector("[data-gamesense-close-media]")?.focus({ preventScroll: true });
  }

  function openPlaylistVideo(video = {}, options = {}) {
    const id = getYouTubePlaylistVideoId(video);
    if (!id) return;
    const category = normalizePlaylistFilter(options.autoplayCategory || "");
    const queue = Array.isArray(options.autoplayQueue) && options.autoplayQueue.length
      ? options.autoplayQueue
      : getPlaylistAutoplayQueue(category);
    openMediaPlayer({
      platform: "youtube",
      id,
      title: video.title || "Featured VALORANT video",
      url: getPlaylistVideoWatchUrl(video) || `https://www.youtube.com/watch?v=${id}`,
      startSeconds: video.startSeconds,
      sourceLabel: video.archiveOnly ? "Historical Guide" : "Featured Video",
      watchKey: getPlaylistVideoWatchKey(video),
      autoplay: options.autoplay === true,
      autoplayCategory: category,
      autoplayQueue: queue
    });
  }

  function renderPlaylistLiveCard(stream) {
    const platform = String(stream.platform || "").toLowerCase();
    const isYouTube = platform === "youtube" && /^[A-Za-z0-9_-]{11}$/.test(String(stream.id || ""));
    const twitchChannel = platform === "twitch" ? getTwitchChannel(stream) : "";
    const action = isYouTube
      ? `data-gamesense-play-video="${escapeHtml(stream.id)}"`
      : twitchChannel
        ? `data-gamesense-play-twitch="${escapeHtml(twitchChannel)}"`
        : `data-gamesense-open-live="${escapeHtml(stream.url)}"`;
    const viewers = Number(stream.viewerCount);
    return `<article class="gamesense-video-card gamesense-live-card" data-live-platform="${escapeHtml(platform)}">
      <button class="gamesense-video-thumb" type="button" ${action} aria-label="Play ${escapeHtml(stream.channel)} live stream">${renderMediaThumbnail(stream.thumbnail)}<i aria-hidden="true"></i><b>Live</b></button>
      <div><span>${escapeHtml(platform || "live")}</span><h3>${escapeHtml(stream.title)}</h3><p>${escapeHtml(stream.channel)}${Number.isFinite(viewers) ? ` | ${viewers.toLocaleString()} watching` : ""}</p><a href="${escapeHtml(stream.url)}" target="_blank" rel="noopener noreferrer">Open on ${platform === "twitch" ? "Twitch" : "YouTube"}</a></div>
    </article>`;
  }

  function renderPlaylistHome(items) {
    const newVideos = items.filter(item => (
      item.isNewIn24Hours
      && !item.isLive
      && String(item.platform || "youtube").toLowerCase() !== "twitch"
      && item.sourceType !== "twitch-archive"
    ));
    const liveStreams = featuredPlaylist?.liveStreams || [];
    const liveAvailability = featuredPlaylist?.liveAvailability || {};
    const liveCopy = liveStreams.length
      ? liveStreams.map(renderPlaylistLiveCard).join("")
      : `<p class="gamesense-playlist-empty">${liveAvailability.youtube || liveAvailability.twitch ? "No verified VALORANT streams are live right now." : "Live checks will appear here once the server credentials are connected."}</p>`;
    return `<section class="gamesense-playlist-home">
      <div class="gamesense-playlist-section-head"><span>Released in the last 24 hours</span><strong>${newVideos.length}</strong></div>
      <div class="gamesense-playlist-grid">${newVideos.length ? newVideos.map(renderPlaylistVideoCard).join("") : `<p class="gamesense-playlist-empty">No trusted creator released a new video in the last 24 hours.</p>`}</div>
      <div class="gamesense-playlist-live-break"><span>Live now</span></div>
      <div class="gamesense-playlist-grid gamesense-live-grid">${liveCopy}</div>
    </section>`;
  }

  function renderPlaylistSection(title, items, options = {}) {
    if (!items.length) return "";
    const historical = options.historical === true;
    const copy = String(options.copy || "").trim();
    return `<section class="gamesense-playlist-catalog-section${historical ? " is-historical" : ""}">
      <div class="gamesense-playlist-section-head"><span>${escapeHtml(title)}</span><strong>${items.length}</strong></div>
      ${copy ? `<p class="gamesense-playlist-section-copy">${escapeHtml(copy)}</p>` : ""}
      <div class="gamesense-playlist-grid">${items.map(video => renderPlaylistVideoCard(video, { historical, autoplayCategory: options.autoplayCategory })).join("")}</div>
    </section>`;
  }

  function renderHistoricalPlaylistArchive(items) {
    const groups = new Map();
    const topicOrder = ["Map Knowledge", "Agent", "Role"];
    items.forEach(video => {
      const topic = String(video.topicType || "General");
      const target = String(video.targetName || "General");
      const key = `${topic}\u0000${target}`;
      if (!groups.has(key)) groups.set(key, { topic, target, items: [] });
      groups.get(key).items.push(video);
    });
    const orderedGroups = [...groups.values()].sort((left, right) => (
      (topicOrder.indexOf(left.topic) + 1 || 99) - (topicOrder.indexOf(right.topic) + 1 || 99)
      || left.target.localeCompare(right.target)
    ));
    if (!orderedGroups.length) return `<p class="gamesense-playlist-empty">No verified historical guides are available right now.</p>`;
    return `<section class="gamesense-playlist-historical-archive">
      <div class="gamesense-playlist-section-head"><span>Historical archive</span><strong>${items.length}</strong></div>
      <p class="gamesense-playlist-section-copy">Verified map, agent, and role guides are grouped by their original coaching subject. Open a subject to browse its full guide history.</p>
      <div class="gamesense-playlist-historical-groups">
        ${orderedGroups.map((group, index) => `<details class="gamesense-playlist-historical-group"${index === 0 ? " open" : ""}>
          <summary><span>${escapeHtml(group.topic)}</span><strong>${escapeHtml(group.target)}</strong><em>${group.items.length} ${group.items.length === 1 ? "video" : "videos"}</em></summary>
          <div class="gamesense-playlist-grid">${group.items.map(video => renderPlaylistVideoCard(video, { historical: true })).join("")}</div>
        </details>`).join("")}
      </div>
    </section>`;
  }

  function isFeaturedPlaylistLoading() {
    return featuredPlaylistStatus === "idle" || featuredPlaylistStatus === "loading";
  }

  function renderPlaylistLoadingState(activeFilter = "Home") {
    const label = activeFilter === "Home" ? "playlist" : `${activeFilter} videos`;
    return `<section class="gamesense-playlist-loading" role="status" aria-live="polite" aria-label="Loading ${escapeHtml(label)}">
      <span class="gamesense-playlist-loading-spinner" aria-hidden="true"></span>
      <div><strong>Loading verified ${escapeHtml(label)}</strong><p>Preparing this category now.</p></div>
    </section>`;
  }

  function renderPlaylistLoadFailure() {
    return `<section class="gamesense-playlist-loading is-error" role="alert">
      <div><strong>Playlist temporarily unavailable</strong><p>${escapeHtml(featuredPlaylistError || "The latest Playlist catalog could not be loaded.")}</p></div>
      <button type="button" data-gamesense-playlist-retry>Try again</button>
    </section>`;
  }

  function renderPlaylist() {
    const items = featuredPlaylist?.items || [];
    const historicalItems = featuredPlaylist?.historicalItems || [];
    const activeFilter = normalizePlaylistFilter(state.playlistFilter);
    const liveStreams = featuredPlaylist?.liveStreams || [];
    const visible = activeFilter === "All"
      ? items
      : activeFilter === "Home"
        ? []
        : activeFilter === "Historical Archive"
          ? []
        : activeFilter === PLAYLIST_LIVE_FILTER
          ? liveStreams
        : activeFilter === "VOD's"
          ? items.filter(isPlaylistVod)
          : items.filter(item => item.topicType === activeFilter);
    const historicalVisible = ["Map Knowledge", "Agent", "Role"].includes(activeFilter)
      ? historicalItems.filter(item => item.topicType === activeFilter)
      : [];
    const playlistContent = isFeaturedPlaylistLoading()
      ? renderPlaylistLoadingState(activeFilter)
      : featuredPlaylistStatus === "failed"
        ? renderPlaylistLoadFailure()
        : activeFilter === "Home"
          ? renderPlaylistHome(items)
          : activeFilter === "Historical Archive"
            ? renderHistoricalPlaylistArchive(historicalItems)
            : activeFilter === PLAYLIST_LIVE_FILTER
              ? `<div class="gamesense-playlist-grid gamesense-live-grid">${visible.length ? visible.map(renderPlaylistLiveCard).join("") : `<p class="gamesense-playlist-empty">No verified VALORANT streams are live right now.</p>`}</div>`
              : `${renderPlaylistSection("Featured videos", visible, { autoplayCategory: activeFilter })}
                  ${renderPlaylistSection("Historical guides", historicalVisible, {
                    historical: true,
                    autoplayCategory: activeFilter,
                    copy: "These verified guides are preserved for historical context and filed under the same coaching category."
                  })}
                  ${!visible.length && !historicalVisible.length ? `<p class="gamesense-playlist-empty">No trusted video is currently filed in this category.</p>` : ""}
                  ${activeFilter === "All" && historicalItems.length ? `<button class="gamesense-playlist-archive-link" type="button" data-gamesense-playlist-filter="Historical Archive">Browse ${historicalItems.length} historical guides</button>` : ""}`;
    return `
      <div class="gamesense-gallery-head gamesense-playlist-gallery-head">
        <div><strong>Featured Playlist</strong><small>Recent trusted releases and a separately preserved historical guide archive, credited to their original creators.</small></div>
        <button class="gamesense-back" type="button" data-gamesense-back="overview">Back to topics</button>
      </div>
      <div class="gamesense-playlist-controls">
        <div class="gamesense-playlist-filters" role="tablist" aria-label="Filter featured videos">
          ${getPlaylistFilters().map(filter => `<button type="button" data-gamesense-playlist-filter="${escapeHtml(filter)}" class="${filter === activeFilter ? "active" : ""}" aria-selected="${filter === activeFilter}"${filter === PLAYLIST_LIVE_FILTER ? ` aria-label="Live streams"` : ""}>${filter === "Home" ? renderPlaylistHomeIcon() : ""}<span>${filter === PLAYLIST_LIVE_FILTER ? `Live <span aria-hidden="true">🔴</span>` : escapeHtml(filter)}</span></button>`).join("")}
        </div>
        ${renderPlaylistAutoplayControl(activeFilter)}
      </div>
      ${playlistContent}`;
  }

  function renderGallery(topic) {
    if (topic === "playlist") return renderPlaylist();
    if (topic === "crosshairs") return renderCrosshairLibrary();
    const meta = topicMeta[topic];
    let items = getTopicItems(topic);
    let controls = "";
    if (topic === "maps") {
      const activeSeason = ["in", "out"].includes(state.mapSeason) ? state.mapSeason : "in";
      state.mapSeason = activeSeason;
      items = items.filter(item => (
        activeSeason === "in"
            ? item.inCompetitivePool !== false
            : item.inCompetitivePool === false
      ));
      controls = `<div class="gamesense-gallery-switcher gamesense-map-season-switcher" role="tablist" aria-label="Map rotation">
        <button type="button" data-gamesense-map-season="in" class="${activeSeason === "in" ? "active" : ""}" aria-selected="${activeSeason === "in"}"><i aria-hidden="true"></i><span>In-Season</span></button>
        <button type="button" data-gamesense-map-season="out" class="${activeSeason === "out" ? "active" : ""}" aria-selected="${activeSeason === "out"}"><i aria-hidden="true"></i><span>Off-Season</span></button>
      </div>`;
    } else if (topic === "agents") {
      const roles = ["all", "duelist", "controller", "initiator", "sentinel"];
      const activeRole = roles.includes(state.agentRole) ? state.agentRole : "all";
      items = activeRole === "all" ? items : items.filter(item => assetSlug(item.role) === activeRole);
      controls = `<div class="gamesense-agent-role-filter" role="tablist" aria-label="Filter agents by role">
        ${roles.map(role => `<button type="button" data-gamesense-agent-role-filter="${role}"${role === "all" ? "" : ` data-role-tone="${role}"`} class="${role === activeRole ? "active" : ""}" aria-selected="${role === activeRole}">${role === "all" ? `<span class="gamesense-agent-role-all-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>` : `<img src="${escapeHtml(roleIconMap[role])}" alt="">`}<span>${role === "all" ? "All Agents" : role}</span></button>`).join("")}
      </div>`;
    }
    return `
      <div class="gamesense-gallery-head gamesense-${escapeHtml(topic)}-gallery-head">
        <div><strong>${escapeHtml(meta.label)} Library</strong></div>
        <button class="gamesense-back" type="button" data-gamesense-back="overview">Back to topics</button>
      </div>
      ${controls}
      <div class="gamesense-entry-grid gamesense-entry-grid-${topic}">
        ${items.map((item, index) => topic === "maps" ? renderMapCard(item, index) : topic === "agents" ? renderAgentCard(item, index) : renderWeaponCard(item, index)).join("")}
      </div>`;
  }

  function renderList(title, items = [], className = "") {
    return `
      <section class="gamesense-note-block ${className}">
        <h3>${escapeHtml(title)}</h3>
        <ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>`;
  }

  function getMapHeatmap(map) {
    const catalog = globalThis.RankedCoachGamesenseHeatmaps;
    return map && catalog && typeof catalog === "object" ? catalog[map.id] || null : null;
  }

  function renderMapHeatmapMeta(map, heatmap) {
    if (!heatmap?.image) {
      return `<aside class="gamesense-heatmap-meta gamesense-heatmap-meta--unavailable"><strong>Plant Heat Map</strong><p>${escapeHtml(heatmap?.unavailableReason || `No verified plant heat-map image is available for ${map.label}.`)}</p></aside>`;
    }
    return `<aside class="gamesense-heatmap-meta"><strong>Plant Heat Map</strong><span>${escapeHtml(heatmap.actLabel || "Verified archive")}</span><p>Published aggregate plant-location reference for this map.</p></aside>`;
  }

  function renderMarkedMap(map) {
    const isHeatmap = state.mapView === "heatmap";
    const isPlants = state.mapView === "plants";
    const heatmap = getMapHeatmap(map);
    const plantSpots = isPlants ? (Array.isArray(map.plantSpots) ? map.plantSpots : []) : [];
    const showPlantHeatmapFallback = isPlants && !plantSpots.length && Boolean(heatmap?.image);
    const markers = isPlants
      ? plantSpots
      : map.calloutLabelsBakedIn
        ? []
        : map.callouts || [];
    const plantFallbackNote = map.plantRateNote || `No source-verified named plant locations are available for ${map.label}.`;
    const plantFallbackCopy = heatmap?.image
      ? `${plantFallbackNote} Showing the verified aggregate plant-density heat map here until named plant pins are sourced.`
      : plantFallbackNote;
    const displayedMapImage = isHeatmap
      ? heatmap.image
      : showPlantHeatmapFallback
        ? heatmap.image
        : (isPlants ? map.plantLayoutImage || map.layoutImage : map.layoutImage);
    const displayedMapAlt = isHeatmap || showPlantHeatmapFallback
      ? `${map.label} plant heat map, ${heatmap?.actLabel || "verified archive"}`
      : isPlants
        ? `${map.label} plant-reference layout`
        : `${map.label} tactical layout`;
    const markerOffsets = [[13, -18], [18, 2], [10, 20], [-22, 15], [-24, -10]];
    return `
      <section class="gamesense-tactical-card">
        <div class="gamesense-section-heading gamesense-map-heading"><span>Marked Tactical Map</span><strong>Map Location Info</strong></div>
        <div class="gamesense-map-view-tabs" role="tablist" aria-label="${escapeHtml(map.label)} tactical map layer">
          <button type="button" data-gamesense-map-view="locations" class="${isPlants || isHeatmap ? "" : "active"}" aria-selected="${isPlants || isHeatmap ? "false" : "true"}">Map Locations</button>
          <button type="button" data-gamesense-map-view="plants" class="${isPlants ? "active" : ""}" aria-selected="${isPlants ? "true" : "false"}">Spike Plant Hot Spots</button>
          <button type="button" data-gamesense-map-view="heatmap" class="${isHeatmap ? "active" : ""}" aria-selected="${isHeatmap ? "true" : "false"}">Heat Map</button>
        </div>
        <div class="gamesense-map-tools" aria-label="Map zoom controls">
          <button type="button" data-gamesense-map-zoom="out" aria-label="Zoom out">-</button>
          <button type="button" data-gamesense-map-zoom="reset">Fit</button>
          <span data-gamesense-map-zoom-value>${Math.round(state.mapZoom * 100)}%</span>
          <button type="button" data-gamesense-map-zoom="in" aria-label="Zoom in">+</button>
        </div>
        <div class="gamesense-map-canvas-row ${isPlants ? "has-plant-legend" : ""}${isHeatmap || showPlantHeatmapFallback ? " is-heatmap" : ""}">
          ${isHeatmap && !heatmap?.image ? "" : `<div class="gamesense-tactical-scroll ${state.mapZoom > 1 ? "is-zoomed" : ""}" data-gamesense-map-viewport tabindex="0" aria-label="Zoomable ${escapeHtml(map.label)} ${isHeatmap || showPlantHeatmapFallback ? "plant heat map" : "tactical map"}">
            <div class="gamesense-tactical-stage${isHeatmap || showPlantHeatmapFallback ? " gamesense-heatmap-stage" : ""}" data-gamesense-map-stage style="--map-zoom:${state.mapZoom};--map-width:${state.mapZoom * 100}%">
              <img src="${escapeHtml(displayedMapImage)}" alt="${escapeHtml(displayedMapAlt)}" loading="eager" draggable="false" referrerpolicy="${isHeatmap || showPlantHeatmapFallback ? "no-referrer" : ""}">
              ${markers.map((callout, index) => {
                if (!isPlants) return `<span class="gamesense-callout" style="--callout-x:${Number(callout.x)}%;--callout-y:${Number(callout.y)}%">${escapeHtml(callout.label)}</span>`;
                const siteIndex = markers.slice(0, index).filter(item => item.site === callout.site).length;
                const offset = markerOffsets[siteIndex % markerOffsets.length];
                const direction = callout.site === "B" ? -1 : 1;
                const plantKey = `${callout.site}${callout.number}`;
                // The tactical image stays uncluttered: plant locations are
                // represented by the spike marker alone. Their names/rates are
                // available in the adjacent accessible legend instead of being
                // repeated over the map art.
                return `<button type="button" class="gamesense-callout gamesense-plant-marker" data-gamesense-plant-key="${escapeHtml(plantKey)}" aria-label="Highlight ${escapeHtml(plantKey)} ${escapeHtml(callout.label)}" style="--callout-x:${Number(callout.x)}%;--callout-y:${Number(callout.y)}%"><i></i></button>`;
              }).join("")}
            </div>
          </div>`}
          ${isPlants ? `<aside class="gamesense-plant-legend" aria-label="${escapeHtml(map.label)} plant location reference">
            <strong>Plant location reference</strong>
            ${plantSpots.length ? plantSpots.map(spot => {
              const plantKey = `${spot.site}${spot.number}`;
              return `<div class="gamesense-plant-row" data-gamesense-plant-key="${escapeHtml(plantKey)}">
                <i></i><b>${escapeHtml(plantKey)}</b><span>${escapeHtml(spot.label)}</span>
                <button type="button" class="gamesense-plant-preview-toggle" data-gamesense-plant-preview="${escapeHtml(plantKey)}" aria-expanded="false" aria-label="Show ${escapeHtml(plantKey)} in-game plant reference">+</button>
                <section class="gamesense-plant-preview" hidden>
                  ${spot.previewImage ? `<img src="${escapeHtml(spot.previewImage)}" alt="${escapeHtml(spot.previewLabel || spot.label)}" loading="lazy" referrerpolicy="no-referrer">` : `<div class="gamesense-plant-preview-unavailable">No verified in-game image is available for this spot.</div>`}
                  <div><strong>${escapeHtml(spot.previewLabel || spot.label)}</strong></div>
                </section>
              </div>`;
            }).join("") : `<p>${escapeHtml(plantFallbackCopy)}</p>`}
            ${plantSpots.length ? `<p>Select a marker or its + control to view the in-game location reference.</p>` : ""}
          </aside>` : ""}
          ${isHeatmap ? renderMapHeatmapMeta(map, heatmap) : ""}
        </div>
      </section>`;
  }

  function getMapTipsViewModel(map) {
    const roles = ["Duelist", "Initiator", "Controller", "Sentinel"];
    const activeRole = roles.includes(state.role) ? state.role : "";
    const categories = [
      { id: "attack", label: "Attack side" },
      { id: "defense", label: "Defense side" },
      { id: "sites", label: "Site-specific" },
      { id: "teamplay", label: "Teamplay strats" }
    ];
    const activeCategory = categories.some(item => item.id === state.tipView) ? state.tipView : "attack";
    const baseTips = activeCategory === "attack"
      ? map.macro?.attack || []
      : activeCategory === "defense"
        ? map.macro?.defense || []
        : activeCategory === "sites"
          ? map.siteTips || []
          : map.teamplayTips || [];
    const roleTips = activeRole
      ? (map.roleNotes?.[activeRole] || []).filter(item => typeof item === "string" || item.category === activeCategory)
      : [];
    const tips = [...baseTips, ...roleTips].filter(item => {
      const tipRoles = Array.isArray(item?.roles) ? item.roles : [];
      return !activeRole || !tipRoles.length || tipRoles.includes(activeRole);
    });
    return {
      roles,
      activeRole,
      categories,
      activeCategory,
      roleTips,
      tips,
      // A map with a verified high-rank reference must never look like its
      // dossier is awaiting data just because this particular coaching tab
      // has no authored recommendation. Keep the absence honest without
      // inventing a tactical claim.
      hasVerifiedReference: map?.dataStatus === "verified",
      mapLabel: map?.label || "this map"
    };
  }

  function renderMapTipsPanel(model) {
    const { activeRole, activeCategory, categories, roleTips, tips, hasVerifiedReference, mapLabel } = model;
    return `
      <div class="gamesense-tips-panel" role="tabpanel">
        <div><span>${escapeHtml(categories.find(category => category.id === activeCategory)?.label || "Tips")}</span><strong>${activeRole ? `${escapeHtml(activeRole)} lens` : "All-role read"}</strong></div>
        <div class="gamesense-tip-grid">
          ${tips.length ? tips.map(item => {
            const text = typeof item === "string" ? item : item.text;
            const label = typeof item === "string" ? "Round read" : item.label || "Round read";
            const isRoleTip = Boolean(activeRole && roleTips.includes(item));
            return `<article class="gamesense-tip${isRoleTip ? " is-role-tip" : ""}"><span>${escapeHtml(isRoleTip ? activeRole : label)}</span><p>${escapeHtml(text)}</p></article>`;
          }).join("") : hasVerifiedReference
            ? `<article class="gamesense-tip gamesense-tip-reference"><span>High-rank map reference</span><p>Competitive role layouts and map-specific weapon reads are available below for ${escapeHtml(mapLabel)}. No extra generic tip is shown for this view.</p></article>`
            : `<article class="gamesense-tip gamesense-tip-review-hold"><span>Data still in review</span><p>No tactical recommendation is published for this view until its sources clear the Library corroboration gate.</p></article>`}
        </div>
      </div>`;
  }

  function renderMapTips(map) {
    const model = getMapTipsViewModel(map);
    const { roles, activeRole, categories, activeCategory } = model;
    return `
      <section class="gamesense-tips-hub${activeRole ? " has-role-filter" : ""}"${activeRole ? ` data-role-tone="${activeRole.toLowerCase()}"` : ""}>
        <div class="gamesense-section-heading gamesense-tips-heading"><span>Tips</span><strong>${escapeHtml(map.label)} round plans</strong></div>
        <div class="gamesense-tips-tabs" role="tablist" aria-label="${escapeHtml(map.label)} tip categories">
          ${categories.map(category => `<button type="button" role="tab" data-gamesense-tip-view="${category.id}" class="${category.id === activeCategory ? "active" : ""}" aria-selected="${category.id === activeCategory}">${category.label}</button>`).join("")}
        </div>
        <details class="gamesense-tips-role-filter gamesense-role-lens-menu">
          <summary><span>Role lens</span><strong${activeRole ? ` data-role-tone="${activeRole.toLowerCase()}"` : ""}>${activeRole ? escapeHtml(activeRole) : "All roles"}</strong><i aria-hidden="true"></i></summary>
          <div class="gamesense-role-options">
            <button type="button" data-gamesense-role="all" class="${activeRole ? "" : "active"}" aria-pressed="${activeRole ? "false" : "true"}">All roles</button>
            ${roles.map(role => `<button type="button" data-gamesense-role="${role}" data-role-tone="${role.toLowerCase()}" class="${role === activeRole ? "active" : ""}" aria-pressed="${role === activeRole}">${role}</button>`).join("")}
          </div>
        </details>
        ${renderMapTipsPanel(model)}
      </section>`;
  }

  const weaponConversionEconomyByCategory = Object.freeze({
    rifle: "full_eco",
    sniper: "full_eco",
    shotgun: "full_eco",
    pistol: "pistol",
    eco: "2nd_lost"
  });
  const weaponComparisonGroups = Object.freeze({
    rifle: ["Vandal", "Phantom", "Guardian", "Bulldog"],
    sniper: ["Operator", "Outlaw", "Marshal"],
    shotgun: ["Judge", "Bucky", "Shorty"],
    pistol: ["Ghost", "Sheriff", "Frenzy", "Classic"],
    eco: ["Spectre", "Stinger", "Ares", "Bulldog"]
  });
  const weaponConversionEconomyLabels = Object.freeze({
    pistol: "Pistol-round",
    "2nd_lost": "Second-round loss",
    "2nd_won": "Second-round win",
    full_eco: "Full-buy",
    unknown: "All-round"
  });

  function getVerifiedMapWeaponConversion(map, item) {
    const reference = map?.weaponConversionReference;
    const requestedEconomy = item?.conversionEconomy || weaponConversionEconomyByCategory[item?.category];
    const metrics = reference?.metrics || {};
    // Older retained acts can lack VStats' full-buy bucket for a weapon while
    // still carrying its measured all-round aggregate. Use that explicit
    // provider bucket rather than manufacturing a full-buy value or hiding a
    // legitimate conversion read.
    const economy = metrics?.[item?.weapon]?.[requestedEconomy]
      ? requestedEconomy
      : metrics?.[item?.weapon]?.unknown ? "unknown" : requestedEconomy;
    const metric = metrics?.[item?.weapon]?.[economy];
    if (!economy || !Number.isFinite(Number(metric?.value)) || !Number.isFinite(Number(metric?.rounds))) return null;
    const contenders = (weaponComparisonGroups[item?.category] || [])
      .map(weapon => ({ weapon, metric: metrics?.[weapon]?.[economy] }))
      .filter(entry => Number.isFinite(Number(entry.metric?.value)) && Number.isFinite(Number(entry.metric?.rounds)))
      .sort((left, right) => Number(right.metric.value) - Number(left.metric.value) || right.metric.rounds - left.metric.rounds);
    const comparison = contenders.find(entry => entry.weapon !== item.weapon) || null;
    const economyLabel = weaponConversionEconomyLabels[economy] || economy;
    const source = reference?.source || {};
    const roundedRounds = Math.round(Number(metric.rounds));
    return {
      scope: `${economyLabel} combined`,
      value: Number(metric.value),
      sample: `${roundedRounds.toLocaleString("en-US")} Ascendant-to-Radiant ${source.actLabel || "retained"} ${economyLabel.toLowerCase()} rounds · ${source.provider || "Verified public aggregate"}`,
      comparisonLabel: comparison ? `Comparable ${item.category}` : "Same sample",
      comparisonWeapon: comparison?.weapon || item.weapon,
      comparisonValue: Number(comparison?.metric?.value ?? metric.value)
    };
  }

  function attachVerifiedWeaponConversions(map, suggestions = []) {
    return suggestions.map(item => {
      const roundConversion = getVerifiedMapWeaponConversion(map, item);
      return roundConversion ? { ...item, roundConversion, roundConversionUnavailable: "" } : item;
    });
  }

  function getGeometryWeaponSuggestions(map) {
    const geometry = {
      abyss: ["long exterior lanes and vertical crossings", "compact site entrances after the first lane is cleared"],
      ascent: ["mid-linked rifle lanes and open site crossings", "tight site pockets once utility creates a close fight"],
      bind: ["long approaches and teleporter-adjacent lanes", "compact chokes where a team deliberately holds contact"],
      breeze: ["open sightlines and long cross-map lanes", "protected close pockets after the long lane has been denied"],
      corrode: ["mixed-distance lanes that reward a stable rifle", "site entrances that become close only after utility commits"],
      fracture: ["split-entry lanes and multiple simultaneous approaches", "the short contact created by a coordinated pinch"],
      haven: ["three-site rotations with mixed rifle distances", "site corners once a defender is isolated"],
      icebox: ["vertical lanes and repeated long first contacts", "site boxes and plant cover after an opening angle is cleared"],
      lotus: ["three-site rotations and varied approach distance", "doorways and compact retake contact"],
      pearl: ["long mid and open site approaches", "the close post-plant pocket a team has already chosen"],
      split: ["mid control and narrow-but-repeatable rifle lanes", "vertical site entries and close defender pockets"],
      summit: ["wide exterior lanes and rotating sightlines", "site approaches after the first long contest"],
      sunset: ["mid pressure and mixed-range site fights", "site entry chokes when the route is called in advance"]
    }[map.id] || ["mixed-distance lanes", "a protected close-range pocket"];
    return [
      { weapon: "Vandal", image: "/assets/weapons/vandal.png", category: "rifle", fit: "Rifle baseline", evidence: "The Vandal is the all-range baseline: its first-shot lethality keeps a rifle viable when a round moves from space-taking into a long retake.", note: `${map.label} repeatedly creates ${geometry[0]}; take the rifle when your plan may need a clean opening duel and a later reposition.` },
      { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "Opening-angle tool", side: "DEF", conversion: "Map-geometry read: choose the Operator only when the team can protect the first angle and recover after contact.", evidence: "The Operator earns its value through one protected opening pick, not by forcing every later fight at sniper range.", note: `Use it on ${map.label} only while the round still gives you ${geometry[0]}; swap or save when the fight is likely to collapse into ${geometry[1]}.` },
      { weapon: "Judge", image: "/assets/weapons/judge.png", category: "shotgun", fit: "Close-contact conversion", side: "DEF", conversion: "Map-geometry read: the Judge is strongest when the team intentionally forces a close first contact.", evidence: "The Judge is a commitment weapon: it needs a held choke, a trade plan, and a rifle recovery route after the first conversion.", note: `On ${map.label}, buy it for ${geometry[1]}, not as a replacement for a rifle across the map's open routes.` },
      { weapon: "Ghost", image: "/assets/weapons/ghost.png", category: "pistol", fit: "Pistol-round control", evidence: "The Ghost rewards a disciplined first shot while preserving credits for the utility that makes the round plan work.", note: `Use cover and a called trade on ${map.label}; the pistol is a precision choice, not an invitation to take an unsupported long duel.` }
    ];
  }

  function renderWeaponSuggestions(map) {
    const publishedSuggestions = Array.isArray(map.weaponSuggestions) ? map.weaponSuggestions : [];
    const usesGeometryReference = !publishedSuggestions.length;
    const suggestions = attachVerifiedWeaponConversions(map, usesGeometryReference ? getGeometryWeaponSuggestions(map) : publishedSuggestions);
    const conversionSource = map?.weaponConversionReference?.source;
    return `
      <section class="gamesense-weapon-suggestions${usesGeometryReference ? " gamesense-weapon-suggestions-reference" : ""}">
        <div><span>Weapon Suggestions</span><strong>${usesGeometryReference ? "Map-geometry choices by buy type" : "Highest-value choices by buy type"}</strong></div>
        <p class="gamesense-weapon-source">${conversionSource ? `Round conversion percent uses ${escapeHtml(conversionSource.provider || "the verified public")} Ascendant-to-Radiant ${escapeHtml(conversionSource.actLabel || "retained")} map and economy sample (${escapeHtml(conversionSource.patchLabel || "current patch")}).` : "Round conversion percent is shown only when a verified retained Competitive map sample is available."}</p>
        <div class="gamesense-weapon-suggestion-grid">${suggestions.map(item => `
          <details class="gamesense-weapon-suggestion">
            <summary>
              <span class="gamesense-weapon-suggestion-top"><span aria-hidden="true"></span><span class="gamesense-weapon-fit">${escapeHtml(item.fit)}</span>${item.side ? `<b class="gamesense-weapon-side">${escapeHtml(item.side)}</b>` : `<span aria-hidden="true"></span>`}</span>
              <span class="gamesense-weapon-suggestion-art"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.weapon)}"><i aria-hidden="true"></i></span>
              <strong class="gamesense-weapon-suggestion-name">${escapeHtml(item.weapon)}</strong>
            </summary>
            <div class="gamesense-weapon-suggestion-detail">
              ${item.roundConversion ? `<section class="gamesense-round-conversion"><strong><span class="gamesense-round-conversion-label">${escapeHtml(item.roundConversion.scope)} round conversion percent:</span> <span class="gamesense-round-conversion-value">${Number(item.roundConversion.value).toFixed(2)}%</span></strong><span>${escapeHtml(item.roundConversion.comparisonLabel)} ${escapeHtml(item.roundConversion.comparisonWeapon)}: ${Number(item.roundConversion.comparisonValue).toFixed(2)}% round conversion percent.</span><small>${escapeHtml(item.roundConversion.sample)}</small></section>` : `<section class="gamesense-round-conversion is-unavailable"><strong>Round conversion percent: unavailable</strong><span>${escapeHtml(item.roundConversionUnavailable || "No verified active-season map sample is available.")}</span></section>`}
              ${item.conversion ? `<em class="gamesense-conversion-read">${escapeHtml(item.conversion)}</em>` : ""}
              <p class="gamesense-weapon-evidence">${escapeHtml(item.evidence)}</p>
              <p class="gamesense-weapon-context">${escapeHtml(item.note)}</p>
            </div>
          </details>
        `).join("")}</div>
      </section>`;
  }

  function renderCompRolePickList(map, role = state.compRole) {
    const normalizedRole = ["Controller", "Duelist", "Initiator", "Sentinel"].includes(role) ? role : "Controller";
    const rows = (Array.isArray(map.rolePickRates) ? map.rolePickRates : [])
      .filter(item => item.role === normalizedRole && item.mapSampleAvailable !== false && Number.isFinite(Number(item.mapRate)))
      .sort((left, right) => Number(right.mapRate) - Number(left.mapRate));
    return `
      <div class="gamesense-comp-pick-list" data-role-tone="${normalizedRole.toLowerCase()}" role="tabpanel">
        ${rows.map((item, index) => {
          const hasGlobalRate = item.globalSampleAvailable !== false && Number.isFinite(Number(item.globalRate));
          const difference = hasGlobalRate ? Number(item.mapRate) - Number(item.globalRate) : null;
          const differenceClass = difference > .005 ? "is-above" : difference < -.005 ? "is-below" : "is-even";
          const differenceLabel = difference === null ? "Global comparison unavailable" : `${difference > 0 ? "+" : ""}${difference.toFixed(2)} pts vs global`;
          return `<article class="gamesense-comp-pick-row">
            <div class="gamesense-comp-pick-identity">
              <img class="gamesense-comp-pick-art" src="${escapeHtml(getAgentIcon(item.agent))}" data-agent-fallback="${escapeHtml(getAgentFallbackIcon(item.agent))}" alt="" loading="lazy">
              <strong class="gamesense-comp-pick-agent">${escapeHtml(item.agent)}<img src="${escapeHtml(roleIconMap[normalizedRole.toLowerCase()])}" alt="" loading="lazy"></strong>
            </div>
            <span class="gamesense-comp-pick-rank">${String(index + 1).padStart(2, "0")}</span>
            <div class="gamesense-comp-pick-rates">
              <span><b>${Number(item.mapRate).toFixed(2)}%</b><small>${escapeHtml(map.label)} pick</small></span>
              <span><b>${hasGlobalRate ? `${Number(item.globalRate).toFixed(2)}%` : "—"}</b><small>Global pick</small></span>
            </div>
            <em class="${differenceClass}">${escapeHtml(differenceLabel)}</em>
          </article>`;
        }).join("")}
      </div>`;
  }

  function renderCompRolePickExplorer(map) {
    if (!Array.isArray(map.rolePickRates) || !map.rolePickRates.length) return "";
    const roles = ["Controller", "Duelist", "Initiator", "Sentinel"];
    const activeRole = roles.includes(state.compRole) ? state.compRole : "Controller";
    return `
      <details class="gamesense-comp-pick-explorer">
        <summary>WANT TO SEE ALL ${escapeHtml(map.label.toUpperCase())} AGENT PICKRATES?</summary>
        <div class="gamesense-comp-pick-explorer-body">
          <p>Ascendant-to-Radiant Competitive picks from Patch ${escapeHtml(map.compSample?.patchLabel || "current")}. Map share and global share use the same combined patch window.</p>
          <div class="gamesense-comp-role-tabs" role="tablist" aria-label="${escapeHtml(map.label)} agent pick rates by role">
            ${roles.map(role => `<button type="button" data-gamesense-comp-role="${role}" data-role-tone="${role.toLowerCase()}" class="${role === activeRole ? "active" : ""}" aria-pressed="${role === activeRole}">${role}</button>`).join("")}
          </div>
          ${renderCompRolePickList(map, activeRole)}
        </div>
      </details>`;
  }

  function renderCompAgentRead(map, agent = "", insight = "") {
    const links = Array.isArray(map?.lineupLinks) ? map.lineupLinks : [];
    const lineupLinks = links.length
      ? `<nav class="gamesense-comp-read-lineups" aria-label="${escapeHtml(map.label)} lineup resources">${links.map(link => {
        const brand = getLineupBrand(link);
        return `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${brand.logo ? `<img src="${escapeHtml(brand.logo)}" alt="">` : ""}<span>${escapeHtml(brand.name)}</span></a>`;
      }).join("")}</nav>`
      : "";
    return `<div class="gamesense-comp-agent-read is-revealing"><strong>${escapeHtml(agent)}</strong><p>${escapeHtml(insight)}</p>${lineupLinks}</div>`;
  }

  function renderComp(map) {
    const rawComps = (Array.isArray(map.metaComps) && map.metaComps.length ? map.metaComps : [map.metaComp]).slice();
    const comps = getCompRoleLayoutReferences(map, rawComps);
    const hasCurrentSample = comps.length > 0;
    const selectedAgent = state.compAgent;
    const selectedInsight = selectedAgent ? map.agentInsights?.[selectedAgent] : "";
    const sample = map.compSample || {};
    const rankLabel = sample.rankLabel || "Ascendant to Radiant";
    const patchLabel = sample.patchLabel || map.metaComp?.patch || getReference().season?.patch || "Current";
    if (!hasCurrentSample) {
      return `
        <section class="gamesense-comp-card gamesense-comp-unavailable">
          <div><span>Current-Season Comps</span><strong class="gamesense-comp-patch">Patch ${escapeHtml(patchLabel)}</strong></div>
          <p>${escapeHtml(map.compStatus || "No verified current-season composition sample is available for this map.")}</p>
        </section>`;
    }
    return `
      <section class="gamesense-comp-card">
        <div><span>Competitive Comps</span><span class="gamesense-comp-scope"><b>${escapeHtml(rankLabel)}</b><strong class="gamesense-comp-patch">Patch ${escapeHtml(patchLabel)}</strong></span></div>
        <p class="gamesense-comp-source">${escapeHtml(sample.note || "High-rank Competitive pick shares are used as tactical composition references; no five-agent lineup win rate is claimed.")}</p>
        <div class="gamesense-comp-list">${comps.map((comp, index) => {
          const referenceLabels = ["Primary role layout", "Secondary role layout", "Alternate role layout"];
          const roleTotals = getCompRoleTotals(comp);
          return `
            <article class="gamesense-comp-option">
              <div class="gamesense-comp-rank"><span>#${index + 1}</span><strong><b class="gamesense-comp-reference-label">${escapeHtml(comp.label || referenceLabels[index] || "Tactical reference")}</b></strong></div>
              <div class="gamesense-comp-mobile-evidence" aria-label="Composition evidence availability">
                <span><b>Lineup win rate</b><strong>Not published</strong></span>
                <span><b>Round conversion</b><strong>Not published</strong></span>
              </div>
              <div class="gamesense-comp-line">
              <div class="gamesense-comp-agents">${(comp.agents || []).map(agent => `
                <button type="button" data-gamesense-comp-agent="${escapeHtml(agent)}" data-role-tone="${escapeHtml(compAgentRoles[assetSlug(agent)] || "")}" class="${selectedAgent === agent ? "active" : ""}" aria-pressed="${selectedAgent === agent ? "true" : "false"}">
                  <span class="gamesense-comp-agent-identity"><img src="${escapeHtml(getAgentIcon(agent))}" data-agent-fallback="${escapeHtml(getAgentFallbackIcon(agent))}" alt="" loading="eager"><strong>${escapeHtml(agent)}</strong></span>
                  <span class="gamesense-comp-agent-rate"><b>${getCompAgentPickRate(map, agent) === null ? "N/A" : `${getCompAgentPickRate(map, agent).toFixed(2)}%`}</b><small>${escapeHtml(map.label)} pick</small></span>
                </button>
              `).join("")}</div>
              <div class="gamesense-comp-role-summary">
                <div class="gamesense-comp-role-summary-label"><span>Role layout</span><small>Most common high-rank structure</small></div>
                <div class="gamesense-comp-makeup" role="img" aria-label="${escapeHtml(comp.composition)}">${roleTotals.map(item => `<span class="gamesense-comp-role-stat"><i data-role-tone="${escapeHtml(item.role)}" aria-hidden="true"></i><span><b>${item.count}</b><small>${escapeHtml(item.role)}${item.count === 1 ? "" : "s"}</small></span></span>`).join("")}</div>
              </div>
            </div>
          </article>`;
        }).join("")}</div>
        ${selectedInsight ? renderCompAgentRead(map, selectedAgent, selectedInsight) : `<p class="gamesense-comp-prompt">Select an agent to see why the pick succeeds on ${escapeHtml(map.label)}.</p>`}
        ${renderCompRolePickExplorer(map)}
      </section>`;
  }

  function getLineupBrand(link = {}) {
    const hostname = (() => {
      try { return new URL(link.url, window.location.href).hostname.toLowerCase(); }
      catch (_error) { return ""; }
    })();
    if (hostname.includes("lineupsvalorant.com")) {
      return { name: "LineupsValorant", logo: "https://lineupsvalorant.com/static/general%20images/icon.png" };
    }
    if (hostname.includes("upforge.gg")) {
      return { name: "UpForge", logo: "https://upforge.gg/images/logo-icon.webp" };
    }
    return { name: link.label || "Lineup site", logo: "" };
  }

  function renderLineupLink(link) {
    const brand = getLineupBrand(link);
    return `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${brand.logo ? `<img src="${escapeHtml(brand.logo)}" alt="">` : ""}<span>${escapeHtml(link.label || brand.name)}</span></a>`;
  }

  function renderMapDetail(map) {
    if (map.isOverviewShell) {
      return `
        <div class="gamesense-detail-head gamesense-map-detail-head" style="--map-detail-image:url('${escapeHtml(map.cardImage || getMapArtwork(map.label))}')">
          <div><span>Map Dossier</span><h2>${escapeHtml(map.label)}</h2></div>
          <div class="gamesense-map-detail-actions"><span class="gamesense-patch">Reference map art</span><button class="gamesense-back" type="button" data-gamesense-back="maps">Back to maps</button></div>
        </div>
        <section class="gamesense-note-block gamesense-map-shell-note">
          <h3>${escapeHtml(map.label)} dossier pending</h3>
          <p>This map is now listed in the Library index and overview collage. Full coaching callouts, comps, weapon suggestions, and lineup references are not authored yet, so RankedCoach is not filling that gap with guessed strategy.</p>
        </section>`;
    }
    const mapDataPeriod = String(map.metaComp?.patch || map.patchVersion || "Current").trim() || "Current";
    const mapDataPeriodLabel = /^v\d+\s+act\s+\d+$/i.test(mapDataPeriod)
      ? `As of ${mapDataPeriod}`
      : /^patch\s+/i.test(mapDataPeriod)
        ? `As of ${mapDataPeriod}`
        : mapDataPeriod === "Current"
          ? "Current reference"
          : `As of Patch ${mapDataPeriod}`;
    return `
      <div class="gamesense-detail-head gamesense-map-detail-head" style="--map-detail-image:url('${escapeHtml(map.cardImage || getMapArtwork(map.label))}')">
        <div><span>Map Dossier</span><h2>${escapeHtml(map.label)}</h2>${map.dataStatus === "in-review" ? `<small class="gamesense-map-data-status gamesense-map-data-status--caution">Data Still In Review</small>` : ""}${map.inCompetitivePool === false ? `<small class="gamesense-map-season-status">Out of Season</small>` : ""}</div>
        <div class="gamesense-map-detail-actions"><span class="gamesense-patch">${escapeHtml(mapDataPeriodLabel)}</span><button class="gamesense-back" type="button" data-gamesense-back="maps">Back to maps</button></div>
      </div>
      <div class="gamesense-detail-grid">
        ${renderMapTips(map)}
        ${renderComp(map)}
        ${renderWeaponSuggestions(map)}
        <section class="gamesense-lineups">
          <div><span>Find Lineups</span></div>
          <div>${(map.lineupLinks || []).map(renderLineupLink).join("")}</div>
        </section>
      </div>
      ${renderMarkedMap(map)}
      ${renderRelatedVideo(map)}
      ${renderPublishedKnowledge("map", map.label)}`;
  }

  function renderStatChips(stats = {}) {
    return `<dl class="gamesense-stat-chips">${Object.entries(stats).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
  }

  function renderAbilityVideo(video = null) {
    const videoSrc = String(video?.src || "").trim();
    // The official agent pages currently publish their exact ability clips in
    // three Riot CMS collections.  Older agents use `game_data`, while newer
    // releases such as Harbor, Tejo, Veto, Waylay, and Miks use `news` or
    // `news_live`.  They are all first-party Riot assets with the same
    // accounting tag; rejecting the latter two left those valid demos blank.
    if (/^https:\/\/cmsassets\.rgpub\.io\/sanity\/files\/dsfx7636\/(?:game_data|news|news_live)\/[^"'<>]+\.mp4\?accountingTag=VAL$/i.test(videoSrc)) {
      // Provenance stays in the maintainer source audit.  The player-facing
      // ability surface is deliberately the demonstration itself, without a
      // redundant external-source label below every selected ability.
      return `<div class="gamesense-ability-video"><span>Ability demo</span><video class="gamesense-ability-video-player" controls preload="metadata" playsinline aria-label="${escapeHtml(video.title || "VALORANT ability demo")}"><source src="${escapeHtml(videoSrc)}" type="video/mp4"></video></div>`;
    }
    const videoId = String(video?.videoId || "").trim();
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return "";
    const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}${Number(video.startSeconds) > 0 ? `&t=${Math.floor(Number(video.startSeconds))}s` : ""}`;
    return `<div class="gamesense-ability-video"><span>Ability demo</span>${renderYouTubePlayer(videoId, video.title || "VALORANT ability demo", { startSeconds: video.startSeconds })}<a href="${escapeHtml(watchUrl)}" target="_blank" rel="noopener noreferrer">Open demo on YouTube</a></div>`;
  }

  function renderAbilityVideoSlot(ability) {
    return `<div class="gamesense-ability-video-slot">${renderAbilityVideo(ability?.video)}</div>`;
  }

  function renderAbilityDetail(agent, ability, { includeVideo = true } = {}) {
    if (!ability) return "";
    return `
      <article class="gamesense-fact-panel gamesense-ability-panel">
        <div class="gamesense-fact-panel-head"><img src="${escapeHtml(ability.icon)}" alt=""><div><span>${escapeHtml(ability.slot)}</span><h3>${escapeHtml(ability.name)}</h3></div></div>
        <p>${escapeHtml(ability.summary)}</p>
        ${renderStatChips(ability.stats)}
        ${includeVideo ? renderAbilityVideo(ability.video) : ""}
        <div class="gamesense-fact-read"><section><span>Round purpose</span><p>${escapeHtml(ability.purpose)}</p></section><section><span>Setup and difficulty</span><p>${escapeHtml(ability.setup)}</p></section></div>
      </article>`;
  }

  function renderAgentLoreHistory(agent) {
    const history = sortPatchHistoryNewestFirst(Array.isArray(agent.patchHistory) ? agent.patchHistory : []);
    const lore = Array.isArray(agent.lore) ? agent.lore : [];
    return `
      <section class="gamesense-note-block gamesense-agent-facts gamesense-agent-lore-history">
        <h3>Lore and History</h3>
        <div class="gamesense-agent-fact-list">
          ${lore.map(item => `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><p>${escapeHtml(item.note || "")}</p></article>`).join("")}
        </div>
        <details class="gamesense-patch-history">
          <summary>Gameplay history</summary>
          <ol>${history.map(item => `<li><span>Patch ${escapeHtml(item.patch)}</span><p>${escapeHtml(item.note)}</p>${item.source ? `<a href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">Riot patch notes</a>` : ""}</li>`).join("")}</ol>
        </details>
      </section>`;
  }

  function renderAgentDetail(agent) {
    const abilities = agent.abilities || [];
    const selected = abilities.find(ability => ability.id === state.detailId) || abilities[0];
    const hasPublishedPickRate = Number.isFinite(Number(agent.pickRate));
    const usageSource = agent.sampleLabel || "No verified current Competitive usage sample";
    const hasPublishedMapFit = Array.isArray(agent.maps) && agent.maps.length > 0;
    // A dossier should never collapse to an empty map-fit area merely because
    // a public pick/win table has not been published for an agent.  The
    // rotation reference is explicitly labeled as such and carries no made-up
    // rate; once an approved sample exists, the real map fit replaces it.
    const mapFitNames = hasPublishedMapFit
      ? agent.maps.slice()
      : getMaps().filter(map => map.inCompetitivePool !== false).map(map => map.label);
    const mapFitSource = hasPublishedMapFit ? usageSource : "Current competitive rotation reference";
    return `
      <div class="gamesense-detail-head gamesense-agent-detail-head">
        <div><span>${escapeHtml(agent.role)} Field Guide</span><h2>${escapeHtml(agent.label)}</h2></div>
        <div class="gamesense-agent-detail-actions"><span class="gamesense-patch">Active season</span><button class="gamesense-back" type="button" data-gamesense-back="agents">Back to agents</button></div>
      </div>
      <section class="gamesense-agent-hero">
        <div class="gamesense-agent-portrait-wrap">
          <div class="gamesense-agent-rate">
            <span class="gamesense-agent-rate-label">Global Pick Rate</span>
            <span class="gamesense-agent-rate-value"><strong>${hasPublishedPickRate ? safePercent(agent.pickRate) : "--"}</strong>${hasPublishedPickRate && Number.isFinite(Number(agent.pickRateRank)) ? `<b>Rank #${Number(agent.pickRateRank)}</b>` : ""}</span>
            <small>${escapeHtml(usageSource)}</small>
          </div>
          <img src="${escapeHtml(agent.portrait)}" alt="${escapeHtml(agent.label)}" loading="eager">
        </div>
        <div>${renderList("Agent Fundamentals", agent.fundamentals)}${renderAgentLoreHistory(agent)}</div>
      </section>
      <section class="gamesense-selector-section">
        <div class="gamesense-section-heading"><span>Ability Analysis</span><strong>Select an ability</strong></div>
        <div class="gamesense-ability-stage">
          <div class="gamesense-ability-grid">${abilities.map(ability => `
            <button type="button" data-gamesense-ability="${escapeHtml(ability.id)}" class="${ability.id === selected?.id ? "active" : ""}${ability.video ? " has-video" : ""}" aria-pressed="${ability.id === selected?.id}"><img src="${escapeHtml(ability.icon)}" alt=""><span>${escapeHtml(ability.name)}</span><small>${escapeHtml(ability.slot)}</small>${ability.video ? `<em>Demo</em>` : ""}</button>
          `).join("")}</div>
          <span class="gamesense-ability-breaker" aria-hidden="true"></span>
          ${renderAbilityVideoSlot(selected)}
        </div>
        ${renderAbilityDetail(agent, selected, { includeVideo: false })}
      </section>
      <section class="gamesense-comp-card gamesense-map-fit">
        <div><span>Map Fit</span><strong>${escapeHtml(mapFitSource)}</strong></div>
        <div class="gamesense-map-fit-grid">${mapFitNames.length ? mapFitNames.sort((leftName, rightName) => {
          const leftWin = Number(agent.mapWinRates?.[leftName]);
          const rightWin = Number(agent.mapWinRates?.[rightName]);
          const leftHasWin = Number.isFinite(leftWin);
          const rightHasWin = Number.isFinite(rightWin);
          if (leftHasWin !== rightHasWin) return leftHasWin ? -1 : 1;
          if (leftHasWin && rightWin !== leftWin) return rightWin - leftWin;
          return Number(agent.mapPickRates?.[rightName] || -1) - Number(agent.mapPickRates?.[leftName] || -1);
        }).slice(0, 3).map(mapName => {
          const normalizedMapName = assetSlug(mapName);
          const map = getMaps().find(item => item.id === normalizedMapName || assetSlug(item.label) === normalizedMapName);
           const winRate = agent.mapWinRates?.[mapName];
          const pickRate = agent.mapPickRates?.[mapName];
          const tagName = map ? "button" : "article";
          const action = map ? ` type="button" data-gamesense-open="maps" data-gamesense-item-target="${escapeHtml(map.id)}"` : "";
          const fullArtwork = getMapArtwork(mapName);
          const thumbnailArtwork = getOverviewMapThumbnail(map || { label: mapName });
          const mapArtwork = thumbnailArtwork || fullArtwork;
          const fallback = thumbnailArtwork && fullArtwork ? ` data-gamesense-overview-fallback-src="${escapeHtml(fullArtwork)}"` : "";
          const hasMapRates = Number.isFinite(Number(pickRate)) || Number.isFinite(Number(winRate));
          return `<${tagName} class="gamesense-map-fit-item${hasPublishedMapFit ? "" : " is-reference-fit"}"${action}><img src="${escapeHtml(mapArtwork)}" alt="" loading="lazy" decoding="async"${fallback}><span>${escapeHtml(mapName)}</span><div><strong>${Number.isFinite(Number(pickRate)) ? `${Number(pickRate).toFixed(2)}% pick` : hasMapRates ? "Pick pending" : "Role fit"}</strong><strong>${Number.isFinite(Number(winRate)) ? `${Number(winRate).toFixed(2)}% win` : hasMapRates ? "Win pending" : "Map reference"}</strong></div></${tagName}>`;
        }).join("") : `<p class="gamesense-map-fit-unavailable">No verified current-season map-fit sample is attached to this agent dossier.</p>`}</div>
      </section>
      ${renderRelatedVideo(agent)}
      ${renderPublishedKnowledge("agent", agent.label, { includeGeneral: false })}`;
  }

  function safePercent(value) {
    return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : "Pending";
  }

  function formatDamageValue(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "--";
    return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, "");
  }

  function renderDamageTable(weapon) {
    const complete = completeWeapon(weapon);
    const ranges = hasCompleteDamageRanges(complete.damageRanges) ? complete.damageRanges : [];
    return `
      <div class="gamesense-damage-table" role="table" aria-label="${escapeHtml(complete.label)} damage by range">
        ${ranges.length > 1 ? `<div class="gamesense-damage-range-pager" role="tablist" aria-label="Select damage range">
          ${ranges.map((range, index) => `<button type="button" role="tab" data-gamesense-damage-range="${index}" aria-label="Show ${escapeHtml(range.range)} damage" aria-selected="${index === 0}" class="${index === 0 ? "active" : ""}"><i aria-hidden="true"></i></button>`).join("")}
        </div>` : ""}
        ${ranges.map((range, index) => `<article class="gamesense-damage-target-row${index === 0 ? " is-mobile-range-active" : ""}" data-gamesense-damage-range-panel="${index}" role="tabpanel" aria-label="${escapeHtml(range.range)}: ${formatDamageValue(range.head)} head, ${formatDamageValue(range.body)} body, ${formatDamageValue(range.legs)} legs">
          <strong class="gamesense-damage-range">${escapeHtml(range.range)}</strong>
          <div class="gamesense-damage-target">
            <img class="gamesense-target-dummy" src="assets/library/target-dummy.svg?v=20260727-library-coverage-01" alt="Front-facing generic target dummy with head, torso, and legs">
            <i class="gamesense-damage-line is-head" aria-hidden="true"></i>
            <i class="gamesense-damage-line is-body" aria-hidden="true"></i>
            <i class="gamesense-damage-line is-legs" aria-hidden="true"></i>
            <span class="is-head"><b>Head</b><em>${formatDamageValue(range.head)}</em></span>
            <span class="is-body"><b>Body</b><em>${formatDamageValue(range.body)}</em></span>
            <span class="is-legs"><b>Legs</b><em>${formatDamageValue(range.legs)}</em></span>
          </div>
        </article>`).join("")}
      </div>`;
  }

  function findRelatedVideo(item = {}) {
    const terms = [item.label, item.id].map(normalize => assetSlug(normalize)).filter(Boolean);
    return (featuredPlaylist?.items || []).find(video => {
      const title = assetSlug(video.title);
      return terms.some(term => term.length >= 3 && title.includes(term));
    }) || null;
  }

  function renderRelatedVideo(item) {
    const video = findRelatedVideo(item);
    if (!video) return "";
    return `<section class="gamesense-related-video"><div><span>Related Video</span><strong>${escapeHtml(video.title)}</strong><small>${escapeHtml(video.channel)}</small></div><a href="${escapeHtml(video.url)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(video.thumbnail)}" alt="" loading="lazy"><i aria-hidden="true"></i><b>Watch on YouTube</b></a></section>`;
  }

  function renderWeaponFact(weapon) {
    if (!weapon) return "";
    const focus = weapon.focus || "Canonical weapon facts are available. Tactical guidance is still in review.";
    const whenToUse = (weapon.whenToUse || []).length ? weapon.whenToUse : ["No verified use-case guidance is published yet."];
    const howToUse = (weapon.howToUse || []).length ? weapon.howToUse : ["No verified handling guidance is published yet."];
    return `
      <article class="gamesense-fact-panel gamesense-weapon-panel">
        <div class="gamesense-weapon-panel-art"><img src="${escapeHtml(weapon.image)}" alt="${escapeHtml(weapon.label)}"></div>
        <div class="gamesense-weapon-panel-copy"><span>Weapon Analysis</span><h3>${escapeHtml(weapon.label)}</h3><div class="gamesense-global-rate"><strong>Global usage ${safePercent(weapon.pickRate)}</strong><strong>Global kill conversion ${Number.isFinite(weapon.killConversion) ? `${weapon.killConversion.toFixed(2)} K/D` : "Unavailable"}</strong><strong>Round conversion ${escapeHtml(weapon.roundConversion || "Unavailable")}</strong></div><p class="gamesense-round-conversion-note">A single all-buy round conversion is not published. Compare eco, light, and full-buy results separately.</p><p>${escapeHtml(focus)}</p></div>
        ${renderStatChips({ Cost: `${weapon.cost} credits`, Magazine: `${weapon.magazine}`, "Fire rate": weapon.fireRate, Penetration: weapon.penetration })}
        ${renderDamageTable(weapon)}
        <div class="gamesense-weapon-guidance">
          <section><span>When to use it</span><ul>${whenToUse.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
          <section><span>How to use it</span><ul>${howToUse.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
        </div>
        <details class="gamesense-patch-history gamesense-weapon-history">
          <summary>Patch history</summary>
          <ol>${sortPatchHistoryNewestFirst(weapon.patchHistory || []).map(item => `<li><span>${escapeHtml(item.patch.startsWith("Patch") ? item.patch : `Patch ${item.patch}`)}</span><p>${escapeHtml(item.note)}</p>${item.source ? `<a href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">Riot source</a>` : ""}</li>`).join("")}</ol>
        </details>
      </article>`;
  }

  function renderWeaponCollectionArchive(weapon, collections = null, loadError = "") {
    if (!weapon) return "";
    const tierOrder = new Map(["select", "deluxe", "premium", "exclusive", "ultra"].map((tier, index) => [tier, index]));
    const tierFilters = [...new Map((collections || []).filter(item => item.editionKey).map(item => [item.editionKey, item])).values()]
      .sort((left, right) => (tierOrder.get(left.editionKey) ?? 99) - (tierOrder.get(right.editionKey) ?? 99));
    const count = Array.isArray(collections) ? collections.length : 0;
    const visibleCollections = Array.isArray(collections) ? collections.slice(0, COLLECTION_ARCHIVE_BATCH_SIZE) : [];
    return `
      <section class="gamesense-collection-archive" data-gamesense-collection-weapon="${escapeHtml(weapon.id)}">
        <div class="gamesense-collection-head">
          <div><span>Historical Reference</span><h3>${escapeHtml(weapon.label)} Skin Collection Archive</h3></div>
          <p>${count ? `${count} exact ${escapeHtml(weapon.label)} weapon previews.` : `Loading every available ${escapeHtml(weapon.label)} collection.`} Riot edition is the official content tier, not a community review score.</p>
        </div>
        ${loadError ? `<div class="gamesense-collection-status is-error"><strong>Skin archive unavailable.</strong><span>${escapeHtml(loadError)}</span><button type="button" data-gamesense-collection-retry="${escapeHtml(weapon.id)}">Try again</button></div>` : !collections ? `<div class="gamesense-collection-status" aria-live="polite"><span class="gamesense-collection-loader" aria-hidden="true"></span><strong>Loading ${escapeHtml(weapon.label)} collections...</strong></div>` : `
          <div class="gamesense-collection-filters" role="group" aria-label="Filter ${escapeHtml(weapon.label)} collections by Riot edition">
            <button type="button" class="active" data-gamesense-collection-filter="all" aria-pressed="true"><span class="gamesense-tier-icon-stack" aria-hidden="true">${tierFilters.map(item => item.editionIcon ? `<img src="${escapeHtml(item.editionIcon)}" alt="">` : "").join("")}</span><span>All ${count}</span></button>
            ${tierFilters.map(item => `<button type="button" data-gamesense-collection-filter="${escapeHtml(item.editionKey)}" aria-pressed="false">${item.editionIcon ? `<img class="gamesense-tier-icon" src="${escapeHtml(item.editionIcon)}" alt="" aria-hidden="true">` : ""}<span>${escapeHtml(item.edition)}</span></button>`).join("")}
          </div>
          <div class="gamesense-collection-grid" data-gamesense-collection-rendered="${visibleCollections.length}" data-gamesense-collection-total="${count}">
            ${renderWeaponCollectionCards(visibleCollections)}
          </div>`}
      </section>`;
  }

  function renderWeaponCollectionCards(collections = []) {
    return collections.map(item => `<article class="gamesense-collection-card" tabindex="0" data-gamesense-collection-tier="${escapeHtml(item.editionKey)}" data-gamesense-collection-preview data-preview-id="${escapeHtml(item.id)}" data-preview-src="${escapeHtml(item.previewImage || item.image)}" data-preview-name="${escapeHtml(item.name)}" data-preview-weapon="${escapeHtml(item.weaponName)}" aria-label="${escapeHtml(item.name)} ${escapeHtml(item.weaponName)} skin collection">
      <div class="gamesense-collection-art">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)} ${escapeHtml(item.weaponName)} skin" loading="lazy">
        <button class="gamesense-collection-open" type="button" data-gamesense-collection-open aria-label="Open ${escapeHtml(item.name)} ${escapeHtml(item.weaponName)} interactive preview">Open Preview</button>
      </div>
      <span class="gamesense-collection-divider" aria-hidden="true"></span>
      <div class="gamesense-collection-copy">
        <span>${escapeHtml(item.weaponName)} skin</span>
        <h4>${escapeHtml(item.name)}</h4>
        <div class="gamesense-collection-meta"><b>${escapeHtml(item.edition)} Riot edition</b><b>${item.variants?.length || item.views?.length || 1} verified color ${(item.variants?.length || item.views?.length || 1) === 1 ? "variant" : "variants"}</b></div>
      </div>
    </article>`).join("");
  }

  function scheduleWeaponCollectionBatches(archive, weapon, collections = []) {
    const grid = archive?.querySelector?.(".gamesense-collection-grid");
    if (!grid || collections.length <= COLLECTION_ARCHIVE_BATCH_SIZE) return;
    const token = ++collectionArchiveRenderToken;
    let offset = Math.max(
      COLLECTION_ARCHIVE_BATCH_SIZE,
      Number(grid.dataset.gamesenseCollectionRendered || COLLECTION_ARCHIVE_BATCH_SIZE)
    );
    if (offset >= collections.length) return;
    const schedule = callback => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(callback, { timeout: 180 });
      } else {
        window.setTimeout(() => callback({ timeRemaining: () => 8 }), 16);
      }
    };
    const appendBatch = () => {
      if (token !== collectionArchiveRenderToken || !grid.isConnected || getSelectedWeapon()?.id !== weapon.id) return;
      const batch = collections.slice(offset, offset + COLLECTION_ARCHIVE_BATCH_SIZE);
      const template = document.createElement("template");
      template.innerHTML = renderWeaponCollectionCards(batch);
      const activeFilter = archive.querySelector("[data-gamesense-collection-filter].active")?.dataset?.gamesenseCollectionFilter || "all";
      template.content.querySelectorAll("[data-gamesense-collection-tier]").forEach(card => {
        card.hidden = activeFilter !== "all" && card.dataset.gamesenseCollectionTier !== activeFilter;
      });
      grid.append(template.content);
      offset += batch.length;
      grid.dataset.gamesenseCollectionRendered = String(offset);
      if (offset < collections.length) schedule(appendBatch);
    };
    schedule(appendBatch);
  }

  function renderWeaponDetail(group) {
    const weapons = group.weapons || [];
    const selected = weapons.find(weapon => weapon.id === state.detailId) || weapons[0];
    return `
      <div class="gamesense-detail-head gamesense-weapon-detail-head">
        <div><span>Weapon Dossier</span><h2>${escapeHtml(group.label)}</h2></div>
        <div class="gamesense-weapon-detail-actions"><span class="gamesense-patch">As of Patch ${escapeHtml(getReference().season?.patch || "Current")}</span><button class="gamesense-back" type="button" data-gamesense-back="weapons">Back to weapons</button></div>
      </div>
      <section class="gamesense-selector-section">
        <div class="gamesense-section-heading"><span>Arsenal</span><strong>Select a weapon</strong></div>
        <div class="gamesense-weapon-grid">${weapons.map(weapon => `
          <button type="button" data-gamesense-weapon="${escapeHtml(weapon.id)}" class="${weapon.id === selected?.id ? "active" : ""}" aria-pressed="${weapon.id === selected?.id}"><img src="${escapeHtml(weapon.image)}" alt=""><span>${escapeHtml(weapon.label)}</span><small>${weapon.cost} credits</small></button>
        `).join("")}</div>
        ${renderWeaponFact(selected)}
      </section>
      ${renderWeaponCollectionArchive(selected, getWeaponCollectionProvider()?.getCached(selected?.label), collectionLoadErrors.get(selected?.label) || "")}
      ${renderRelatedVideo(selected)}
      ${renderPublishedKnowledge("weapon", selected?.label, { includeGeneral: false })}`;
  }

  function getSelectedWeapon() {
    if (state.topic !== "weapons" || !state.itemId) return null;
    const group = getReference().weapons?.find(item => item.id === state.itemId);
    return group?.weapons?.find(item => item.id === state.detailId) || group?.weapons?.[0] || null;
  }

  function replaceWeaponCollectionArchive(weapon, collections = null, loadError = "") {
    const archive = document.querySelector("#gamesenseLibraryView .gamesense-collection-archive");
    if (!archive || !weapon || getSelectedWeapon()?.id !== weapon.id) return null;
    collectionArchiveRenderToken += 1;
    const replacement = replaceTargetedElement(archive, renderWeaponCollectionArchive(weapon, collections, loadError));
    if (replacement && Array.isArray(collections)) scheduleWeaponCollectionBatches(replacement, weapon, collections);
    return replacement;
  }

  function hydrateWeaponCollectionArchive(weapon = getSelectedWeapon(), options = {}) {
    const provider = getWeaponCollectionProvider();
    if (!weapon || !provider) return;
    const cached = provider.getCached(weapon.label);
    if (cached) {
      collectionLoadErrors.delete(weapon.label);
      const archive = document.querySelector("#gamesenseLibraryView .gamesense-collection-archive");
      const renderedGrid = archive?.querySelector?.(".gamesense-collection-grid");
      const alreadyRendered = archive?.dataset?.gamesenseCollectionWeapon === weapon.id
        && Number(renderedGrid?.dataset?.gamesenseCollectionTotal || -1) === cached.length;
      if (alreadyRendered) {
        scheduleWeaponCollectionBatches(archive, weapon, cached);
        return;
      }
      replaceWeaponCollectionArchive(weapon, cached);
      return;
    }
    if (options.retry) {
      collectionLoadErrors.delete(weapon.label);
      replaceWeaponCollectionArchive(weapon);
    }
    provider.loadForWeapon(weapon.label).then(collections => {
      if (getSelectedWeapon()?.id !== weapon.id) return;
      collectionLoadErrors.delete(weapon.label);
      replaceWeaponCollectionArchive(weapon, collections);
    }).catch(error => {
      if (getSelectedWeapon()?.id !== weapon.id) return;
      const message = String(error?.message || "The live collection catalog could not be reached.");
      collectionLoadErrors.set(weapon.label, message);
      replaceWeaponCollectionArchive(weapon, null, message);
    });
  }

  function closeSkinPreview() {
    const overlay = activeSkinPreview;
    if (!overlay) return;
    activeSkinPreview = null;
    activeSkinViewIndex = 0;
    activeSkinVideoIndex = 0;
    overlay.querySelectorAll("iframe").forEach(frame => frame.removeAttribute("src"));
    overlay.querySelectorAll("video").forEach(video => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    });
    overlay.classList.remove("is-open");
    overlay.classList.add("is-closing");
    window.setTimeout(() => {
      overlay.remove();
      if (!document.querySelector('[role="dialog"], .lens-modal-overlay.active')) {
        document.body.classList.remove("mobile-modal-open");
      }
    }, 220);
  }

  function getSkinPreviewItem(trigger) {
    const weapon = String(trigger?.dataset?.previewWeapon || "Weapon").trim();
    const id = String(trigger?.dataset?.previewId || "").trim();
    const cached = getWeaponCollectionProvider()?.getCached(weapon) || [];
    const item = cached.find(collection => collection.id === id);
    if (item) return item;
    const source = String(trigger?.dataset?.previewSrc || "").trim();
    const name = String(trigger?.dataset?.previewName || "Weapon skin").trim();
    const model = getWeaponCollectionProvider()?.getSketchfabModel?.(name, weapon, 0) || null;
    return {
      id,
      name,
      weaponName: weapon,
      previewImage: source,
      variants: source ? [{ id: `${id}-variant-1`, source, label: "Default variant", video: "", sketchfabModel: model }] : [],
      views: source ? [{ id: `${id}-variant-1`, source, label: "Default variant", video: "", sketchfabModel: model }] : [],
      upgradeVideos: [],
      sketchfabModel: model,
      bundleVideo: null
    };
  }

  function toRomanNumeral(value = 1) {
    let remaining = Math.max(1, Math.min(99, Math.floor(Number(value) || 1)));
    const numerals = [[50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    return numerals.reduce((result, [amount, symbol]) => {
      while (remaining >= amount) {
        result += symbol;
        remaining -= amount;
      }
      return result;
    }, "");
  }

  function getApprovedSkinVideoUrl(value = "") {
    try {
      const url = new URL(String(value));
      const approvedHosts = new Set(["media.valorant-api.com", "valorant.dyn.riotcdn.net"]);
      return url.protocol === "https:" && approvedHosts.has(url.hostname) && /\.mp4$/i.test(url.pathname) ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function getSkinPreviewVideos(item, variants) {
    const videos = [];
    const seen = new Map();
    const addVideo = (entry, kind, ordinal, poster = "") => {
      const video = getApprovedSkinVideoUrl(entry?.video);
      if (!video) return -1;
      if (seen.has(video)) return seen.get(video);
      const index = videos.length;
      videos.push({
        id: String(entry?.id || `${kind}-${index + 1}`),
        kind,
        label: String(entry?.label || `${kind === "level" ? "Upgrade" : "Variant"} ${index + 1}`).trim(),
        displayLabel: `${kind === "level" ? "Level" : "Variant"} ${toRomanNumeral(ordinal + 1)}`,
        poster: String(poster || item?.previewImage || variants[0]?.source || "").trim(),
        video
      });
      seen.set(video, index);
      return index;
    };
    (item?.upgradeVideos || []).forEach((level, index) => addVideo(level, "level", index));
    const directVariantIndexes = variants.map((variant, index) => addVideo(variant, "variant", index, variant.source));
    const fallbackIndex = [...(item?.upgradeVideos || []).keys()]
      .map(index => seen.get(getApprovedSkinVideoUrl(item.upgradeVideos[index]?.video)))
      .filter(index => Number.isInteger(index))
      .at(-1) ?? (videos.length ? 0 : -1);
    const variantIndexes = directVariantIndexes.map(index => index >= 0 ? index : fallbackIndex);
    return { videos, variantIndexes, directVariantIndexes };
  }

  function renderStaticSkinModelMarkup(source = "", alt = "", label = "Static render — exact 3D unavailable") {
    return `<img data-skin-preview-image src="${escapeHtml(source)}" alt="${escapeHtml(alt)}" draggable="false"><span class="gamesense-skin-model-unavailable">${escapeHtml(label)}</span><div class="gamesense-skin-static-controls" aria-label="Inspect static weapon render"><button type="button" data-skin-static-zoom="out" aria-label="Zoom out static weapon render">−</button><button type="button" data-skin-static-zoom="reset" aria-label="Reset static weapon render zoom">Reset</button><button type="button" data-skin-static-zoom="in" aria-label="Zoom in static weapon render">+</button></div>`;
  }

  function getStaticSkinInspectState(stage) {
    return {
      scale: Number(stage?.dataset?.skinInspectScale || 1) || 1,
      x: Number(stage?.dataset?.skinInspectX || 0) || 0,
      y: Number(stage?.dataset?.skinInspectY || 0) || 0
    };
  }

  function setStaticSkinInspectState(stage, nextState = {}) {
    if (!stage) return;
    const previous = getStaticSkinInspectState(stage);
    const scale = Math.max(1, Math.min(4, Math.round(Number(nextState.scale ?? previous.scale) * 100) / 100));
    const rect = stage.getBoundingClientRect();
    const maxX = scale <= 1 ? 0 : Math.max(18, rect.width * (scale - 1) * 0.46);
    const maxY = scale <= 1 ? 0 : Math.max(18, rect.height * (scale - 1) * 0.46);
    const x = scale <= 1 ? 0 : Math.max(-maxX, Math.min(maxX, Number(nextState.x ?? previous.x) || 0));
    const y = scale <= 1 ? 0 : Math.max(-maxY, Math.min(maxY, Number(nextState.y ?? previous.y) || 0));
    stage.dataset.skinInspectScale = String(scale);
    stage.dataset.skinInspectX = String(Math.round(x));
    stage.dataset.skinInspectY = String(Math.round(y));
    stage.style.setProperty("--skin-static-scale", String(scale));
    stage.style.setProperty("--skin-static-pan-x", `${Math.round(x)}px`);
    stage.style.setProperty("--skin-static-pan-y", `${Math.round(y)}px`);
    stage.classList.toggle("is-zoomed", scale > 1.01);
  }

  function resetStaticSkinInspect(stage) {
    setStaticSkinInspectState(stage, { scale: 1, x: 0, y: 0 });
  }

  function bindStaticSkinInspect(stage) {
    if (!stage || stage.dataset.staticSkinInspectBound === "true") return;
    stage.dataset.staticSkinInspectBound = "true";
    const pointers = new Map();
    let dragPointerId = null;
    let dragStart = null;
    let pinchStart = null;
    const pointerDistance = values => Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
    const zoomBy = (amount) => {
      const current = getStaticSkinInspectState(stage);
      setStaticSkinInspectState(stage, { ...current, scale: current.scale + amount });
    };
    stage.addEventListener("wheel", event => {
      if (!stage.classList.contains("is-static")) return;
      event.preventDefault();
      const current = getStaticSkinInspectState(stage);
      const direction = event.deltaY > 0 ? -0.18 : 0.18;
      setStaticSkinInspectState(stage, { ...current, scale: current.scale + direction });
    }, { passive: false });
    stage.addEventListener("click", event => {
      const button = event.target.closest?.("[data-skin-static-zoom]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const action = button.dataset.skinStaticZoom;
      if (action === "reset") {
        resetStaticSkinInspect(stage);
      } else {
        zoomBy(action === "in" ? 0.35 : -0.35);
      }
    });
    stage.addEventListener("dblclick", event => {
      if (!stage.classList.contains("is-static") || event.target.closest?.("button,a")) return;
      event.preventDefault();
      const current = getStaticSkinInspectState(stage);
      setStaticSkinInspectState(stage, current.scale > 1.01 ? { scale: 1, x: 0, y: 0 } : { ...current, scale: 2.15 });
    });
    stage.addEventListener("pointerdown", event => {
      if (!stage.classList.contains("is-static") || event.target.closest?.("button,a")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      try {
        stage.setPointerCapture?.(event.pointerId);
      } catch (_error) {
        // Pointer capture can fail on interrupted touches; the local map still handles the active pointers.
      }
      const values = [...pointers.values()];
      if (values.length === 1) {
        dragPointerId = event.pointerId;
        dragStart = { pointer: values[0], state: getStaticSkinInspectState(stage) };
        stage.classList.add("is-grabbing");
      } else if (values.length === 2) {
        dragPointerId = null;
        dragStart = null;
        pinchStart = { distance: pointerDistance(values), state: getStaticSkinInspectState(stage) };
        stage.classList.add("is-grabbing");
      }
    });
    stage.addEventListener("pointermove", event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const values = [...pointers.values()];
      if (values.length >= 2 && pinchStart?.distance) {
        event.preventDefault();
        const nextScale = pinchStart.state.scale * (pointerDistance(values) / pinchStart.distance);
        setStaticSkinInspectState(stage, { ...pinchStart.state, scale: nextScale });
        return;
      }
      if (dragPointerId !== event.pointerId || !dragStart) return;
      const current = getStaticSkinInspectState(stage);
      if (current.scale <= 1.01) return;
      event.preventDefault();
      setStaticSkinInspectState(stage, {
        ...current,
        x: dragStart.state.x + (event.clientX - dragStart.pointer.x),
        y: dragStart.state.y + (event.clientY - dragStart.pointer.y)
      });
    });
    const stopPointer = event => {
      pointers.delete(event.pointerId);
      if (!pointers.size) {
        dragPointerId = null;
        dragStart = null;
        pinchStart = null;
        stage.classList.remove("is-grabbing");
        return;
      }
      const remaining = [...pointers.values()];
      if (remaining.length === 1) {
        const remainingPointerId = [...pointers.keys()][0];
        dragPointerId = remainingPointerId;
        dragStart = { pointer: remaining[0], state: getStaticSkinInspectState(stage) };
        pinchStart = null;
      }
    };
    stage.addEventListener("pointerup", stopPointer);
    stage.addEventListener("pointercancel", stopPointer);
    stage.addEventListener("dragstart", event => event.preventDefault());
  }

  function setActiveSkinView(nextIndex) {
    const overlay = activeSkinPreview;
    if (!overlay) return;
    const selectors = [...overlay.querySelectorAll("[data-skin-preview-view]")];
    const count = selectors.length;
    if (!count) return;
    activeSkinViewIndex = ((Number(nextIndex) % count) + count) % count;
    const active = selectors[activeSkinViewIndex];
    const image = overlay.querySelector("[data-skin-preview-image]");
    const label = overlay.querySelector("[data-skin-preview-label]");
    if (image) {
      image.src = active.dataset.skinPreviewSource || image.src;
      image.alt = active.dataset.skinPreviewAlt || image.alt;
    }
    if (label) label.textContent = `Variant ${toRomanNumeral(activeSkinViewIndex + 1)} of ${toRomanNumeral(count)}`;
    selectors.forEach((selector, index) => {
      const isActive = index === activeSkinViewIndex;
      selector.classList.toggle("active", isActive);
      selector.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setActiveSkinModel(overlay, variant, name, weapon) {
    const model = /^[a-f0-9]{32}$/i.test(String(variant?.sketchfabModel?.id || "")) ? variant.sketchfabModel : null;
    const stage = overlay?.querySelector(".gamesense-skin-model-stage");
    const kicker = overlay?.querySelector("[data-skin-model-kicker]");
    const guidance = overlay?.querySelector("[data-skin-model-guidance]");
    const footer = overlay?.querySelector("[data-skin-model-footer]");
    const card = overlay?.querySelector(".gamesense-skin-preview-card");
    if (!stage || !footer || !card) return;
    card.classList.toggle("has-true-model", Boolean(model));
    card.classList.toggle("has-static-render", !model);
    stage.classList.toggle("has-model", Boolean(model));
    stage.classList.toggle("is-static", !model);
    if (kicker) kicker.textContent = model ? "True 3D Model" : "Official Weapon Render";
    if (guidance) guidance.textContent = model
      ? "Drag to rotate. Scroll or pinch to zoom."
      : "No approved exact 3D model is available for this color variant yet.";
    if (model) {
      stage.innerHTML = `<iframe src="${escapeHtml(model.embedUrl)}" title="Interactive 3D model of ${escapeHtml(model.title)} by ${escapeHtml(model.creator)}" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; xr-spatial-tracking"></iframe>`;
      footer.innerHTML = `<span>Community model attribution</span><strong>${escapeHtml(model.title)}</strong><small>Created by ${escapeHtml(model.creator)} · <a href="${escapeHtml(model.modelUrl)}" target="_blank" rel="noopener noreferrer">View on Sketchfab</a> · <a href="${escapeHtml(model.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(model.license)}</a></small>`;
      return;
    }
    const count = overlay.querySelectorAll("[data-skin-preview-view]").length || 1;
    const index = Math.max(0, activeSkinViewIndex);
    const searchUrl = `https://sketchfab.com/search?type=models&q=${encodeURIComponent(`${name} ${weapon} Valorant`)}`;
    stage.innerHTML = renderStaticSkinModelMarkup(variant?.source || "", `${name} ${weapon} ${variant?.label || `variant ${index + 1}`}`, "Static render — exact 3D unavailable");
    resetStaticSkinInspect(stage);
    bindStaticSkinInspect(stage);
    footer.innerHTML = `<span>${escapeHtml(weapon)} collection</span><strong>${escapeHtml(name)}</strong><small data-skin-preview-label>Variant ${toRomanNumeral(index + 1)} of ${toRomanNumeral(count)} · <a href="${escapeHtml(searchUrl)}" target="_blank" rel="noopener noreferrer">Search Sketchfab references</a></small>`;
  }

  function setActiveSkinVideo(nextIndex, sourceSelector = null) {
    const overlay = activeSkinPreview;
    if (!overlay) return;
    const selectors = [...overlay.querySelectorAll("[data-skin-preview-video-option]")];
    const selected = sourceSelector?.matches?.("[data-skin-preview-video-option]")
      ? sourceSelector
      : selectors.find(selector => Number(selector.dataset.skinPreviewVideoOption) === Number(nextIndex));
    const video = overlay.querySelector("[data-skin-preview-video]");
    if (!selected || !video) return;
    const staticFallback = overlay.querySelector("[data-skin-animation-static]");
    video.hidden = false;
    if (staticFallback) staticFallback.hidden = true;
    activeSkinVideoIndex = Number(nextIndex);
    const nextSource = selected.dataset.skinPreviewVideoSource || "";
    const nextPoster = selected.dataset.skinPreviewVideoPoster || "";
    const sourceChanged = Boolean(nextSource && video.src !== nextSource);
    const posterChanged = Boolean(nextPoster && video.poster !== nextPoster);
    if (sourceChanged) video.src = nextSource;
    if (posterChanged) video.poster = nextPoster;
    if (sourceChanged || posterChanged) {
      video.load();
      video.play().catch(() => { /* Player controls remain available when autoplay is blocked. */ });
    }
    const label = overlay.querySelector("[data-skin-preview-video-label]");
    if (label) label.textContent = selected.dataset.skinPreviewVideoLabel || "Skin animation";
    const detail = overlay.querySelector("[data-skin-preview-video-detail]");
    if (detail) detail.textContent = selected.dataset.skinPreviewVideoDetail || "Animation supplied by Riot data used by val-skins.";
    selectors.forEach(selector => {
      const isActive = Number(selector.dataset.skinPreviewVideoOption) === activeSkinVideoIndex
        && (!selector.hasAttribute("data-skin-preview-view") || selector === selected);
      selector.classList.toggle("is-video-active", isActive);
      if (!selector.hasAttribute("data-skin-preview-view")) selector.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setStaticSkinAnimation(selector) {
    const overlay = activeSkinPreview;
    if (!overlay || !selector) return;
    const video = overlay.querySelector("[data-skin-preview-video]");
    const staticFallback = overlay.querySelector("[data-skin-animation-static]");
    const unavailable = overlay.querySelector(".gamesense-skin-video-unavailable");
    if (!staticFallback) return;
    const source = selector.dataset.skinPreviewSource || "";
    const alt = selector.dataset.skinPreviewAlt || "Selected weapon color variant";
    const image = staticFallback.querySelector("img");
    if (video) {
      video.pause?.();
      video.hidden = true;
    }
    if (unavailable) unavailable.hidden = true;
    if (image) {
      image.src = source;
      image.alt = alt;
    }
    staticFallback.hidden = false;
    activeSkinVideoIndex = -1;
    const label = overlay.querySelector("[data-skin-preview-video-label]");
    if (label) label.textContent = selector.dataset.skinViewLabel || "Static color preview";
    const detail = overlay.querySelector("[data-skin-preview-video-detail]");
    if (detail) detail.textContent = "No color-specific Riot animation is published for this variant, so its official static render is shown instead.";
    overlay.querySelectorAll("[data-skin-preview-video-option]").forEach(option => {
      option.classList.remove("is-video-active");
      if (!option.hasAttribute("data-skin-preview-view")) option.setAttribute("aria-pressed", "false");
    });
  }

  function setActiveSkinVariantMedia(selector) {
    if (!selector) return;
    const hasDirectVideo = selector.dataset.skinPreviewVideoDirect === "true";
    if (!hasDirectVideo) {
      setStaticSkinAnimation(selector);
      return;
    }
    setActiveSkinVideo(Number(selector.dataset.skinPreviewVideoOption || 0), selector);
  }

  function openSkinPreview(trigger) {
    const item = getSkinPreviewItem(trigger);
    const name = String(item?.name || "Weapon skin").trim();
    const weapon = String(item?.weaponName || "Weapon").trim();
    const variants = (item?.variants || item?.views || []).filter(variant => variant?.source);
    const { videos: previewVideos, variantIndexes: variantVideoIndexes, directVariantIndexes } = getSkinPreviewVideos(item, variants);
    const model = /^[a-f0-9]{32}$/i.test(String(variants[0]?.sketchfabModel?.id || item?.sketchfabModel?.id || ""))
      ? (variants[0]?.sketchfabModel || item.sketchfabModel)
      : null;
    const approvedChannels = new Set(["VALORANT", "Dittozkul"]);
    const requestedVideoId = String(item?.bundleVideo?.id || "");
    const videoId = approvedChannels.has(item?.bundleVideo?.channel) && /^[a-zA-Z0-9_-]{11}$/.test(requestedVideoId) ? requestedVideoId : "";
    const playlistId = item?.bundleVideo?.channel === "VALORANT" && /^[a-zA-Z0-9_-]{34}$/.test(String(item?.bundleVideo?.playlistId || ""))
      ? String(item.bundleVideo.playlistId)
      : "";
    const sketchfabSearchUrl = `https://sketchfab.com/search?type=models&q=${encodeURIComponent(`${name} ${weapon} Valorant`)}`;
    if (!variants.length) return;
    closeSkinPreview();
    activeSkinViewIndex = 0;
    activeSkinVideoIndex = 0;
    const overlay = document.createElement("div");
    overlay.id = "gamesenseSkinPreviewOverlay";
    overlay.className = "gamesense-skin-preview-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", `${name} ${weapon} interactive preview`);
    overlay.tabIndex = -1;
    overlay.innerHTML = `
      <div class="gamesense-skin-preview-card${videoId ? " has-secondary-video" : " is-primary-only"}${model ? " has-true-model" : " has-static-render"}">
        <section class="gamesense-skin-viewer-pane">
          <header><div><span data-skin-model-kicker>${model ? "True 3D Model" : "Official Weapon Render"}</span><strong>${escapeHtml(name)} ${escapeHtml(weapon)}</strong><small data-skin-model-guidance>${model ? "Drag to rotate. Scroll or pinch to zoom." : "No approved exact 3D model is available for this color variant yet."}</small></div></header>
          <div class="gamesense-skin-model-stage${model ? " has-model" : " is-static"}">
            ${model ? `<iframe src="${escapeHtml(model.embedUrl)}" title="Interactive 3D model of ${escapeHtml(model.title)} by ${escapeHtml(model.creator)}" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen></iframe>` : renderStaticSkinModelMarkup(variants[0].source, `${name} ${weapon} ${variants[0].label || "default variant"}`, "Static render — 3D unavailable")}
          </div>
          <footer data-skin-model-footer>${model ? `<span>Community model attribution</span><strong>${escapeHtml(model.title)}</strong><small>Created by ${escapeHtml(model.creator)} · <a href="${escapeHtml(model.modelUrl)}" target="_blank" rel="noopener noreferrer">View on Sketchfab</a> · <a href="${escapeHtml(model.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(model.license)}</a></small>` : `<span>${escapeHtml(weapon)} collection</span><strong>${escapeHtml(name)}</strong><small data-skin-preview-label>Variant I of ${toRomanNumeral(variants.length)} · <a href="${escapeHtml(sketchfabSearchUrl)}" target="_blank" rel="noopener noreferrer">Search Sketchfab references</a></small>`}</footer>
        </section>
        <div class="gamesense-skin-preview-divider" aria-hidden="true"></div>
        <section class="gamesense-skin-media-pane${videoId ? " has-secondary-video" : ""}">
          <div class="gamesense-skin-media-pages">
          <article class="gamesense-skin-animation-preview is-active" data-skin-media-page="0">
            <header><span>Skin Animation</span><strong data-skin-preview-video-label>${escapeHtml(previewVideos[0]?.displayLabel || `${name} preview`)}</strong><small data-skin-preview-video-detail>Animation supplied by Riot data used by val-skins.</small></header>
            <div class="gamesense-skin-animation-frame">${previewVideos.length ? `<video data-skin-preview-video src="${escapeHtml(previewVideos[0].video)}" poster="${escapeHtml(previewVideos[0].poster)}" controls autoplay muted playsinline preload="metadata"></video>` : `<div class="gamesense-skin-video-unavailable"><strong>No animation published</strong><span>This skin does not include a streamed level or variant preview.</span></div>`}<div class="gamesense-skin-animation-static" data-skin-animation-static hidden><img src="${escapeHtml(variants[0].source)}" alt="${escapeHtml(name)} ${escapeHtml(weapon)} ${escapeHtml(variants[0].label || "default variant")}"><strong>Official static color render</strong></div></div>
            <div class="gamesense-skin-option-groups">
              ${(item?.upgradeVideos || []).some(level => getApprovedSkinVideoUrl(level.video)) ? `<section><span>Upgrade levels</span><div style="--skin-option-count:${Math.max(1, (item.upgradeVideos || []).filter(level => getApprovedSkinVideoUrl(level.video)).length)}" role="group" aria-label="Choose a ${escapeHtml(name)} upgrade animation">${(item.upgradeVideos || []).map((level, levelIndex) => {
                const index = previewVideos.findIndex(video => video.video === getApprovedSkinVideoUrl(level.video));
                const roman = toRomanNumeral(levelIndex + 1);
                return index < 0 ? "" : `<button type="button" class="${index === 0 ? "is-video-active" : ""}" data-skin-preview-video-option="${index}" data-skin-preview-video-source="${escapeHtml(previewVideos[index].video)}" data-skin-preview-video-poster="${escapeHtml(previewVideos[index].poster)}" data-skin-preview-video-label="Level ${roman}" data-skin-preview-video-detail="Level-specific animation supplied by Riot data used by val-skins." aria-label="Play ${escapeHtml(level.label)}" title="${escapeHtml(level.label)}" aria-pressed="${index === 0 ? "true" : "false"}">${roman}</button>`;
              }).join("")}</div></section>` : ""}
              <section><span>Color variants</span><div class="gamesense-skin-view-selectors" style="--skin-option-count:${Math.max(1, variants.length)}" role="group" aria-label="Choose a ${escapeHtml(name)} color variant">
                ${variants.map((variant, index) => {
                  const roman = toRomanNumeral(index + 1);
                  const videoIndex = variantVideoIndexes[index];
                  const hasDirectVideo = directVariantIndexes[index] >= 0;
                  const videoLabel = hasDirectVideo ? `Variant ${roman}` : `Shared ${previewVideos[videoIndex]?.displayLabel || "animation"}`;
                  const videoDetail = hasDirectVideo
                    ? "Color-specific animation supplied by Riot data used by val-skins."
                    : "Shared level animation; this color has no separate val-skins/Riot clip.";
                  return `<button type="button" class="${index === 0 ? "active" : ""}${hasDirectVideo && videoIndex === 0 ? " is-video-active" : ""}" data-skin-preview-view="${index}" data-skin-preview-source="${escapeHtml(variant.source)}" data-skin-view-label="Variant ${roman}" data-skin-preview-alt="${escapeHtml(name)} ${escapeHtml(weapon)} ${escapeHtml(variant.label || `variant ${index + 1}`)}" data-skin-preview-video-direct="${hasDirectVideo ? "true" : "false"}"${videoIndex >= 0 ? ` data-skin-preview-video-option="${videoIndex}" data-skin-preview-video-source="${escapeHtml(previewVideos[videoIndex].video)}" data-skin-preview-video-poster="${escapeHtml(variant.source || previewVideos[videoIndex].poster)}" data-skin-preview-video-label="${escapeHtml(videoLabel)}" data-skin-preview-video-detail="${escapeHtml(videoDetail)}"` : ""} aria-label="Show ${escapeHtml(variant.label || `variant ${index + 1}`)}" title="${escapeHtml(variant.label || `Variant ${index + 1}`)}" aria-pressed="${index === 0 ? "true" : "false"}"><span class="gamesense-skin-variant-thumb">${variant.swatch ? `<img class="gamesense-skin-variant-swatch" src="${escapeHtml(variant.swatch)}" alt="">` : ""}<img src="${escapeHtml(variant.source)}" alt=""></span></button>`;
                }).join("")}
              </div></section>
            </div>
          </article>
          ${videoId ? `<article class="gamesense-skin-video-pane" data-skin-media-page="1" hidden>
            <header><span>Collection Video</span><strong>${escapeHtml(item.bundleVideo.title)}</strong><small>${escapeHtml(item.bundleVideo.channel)}${item.bundleVideo.channel === "VALORANT" ? " official SKINS playlist" : " approved fallback"}</small></header>
            <div class="gamesense-skin-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(videoId)}?rel=0&amp;playsinline=1${playlistId ? `&amp;list=${escapeHtml(playlistId)}` : ""}" title="${escapeHtml(item.bundleVideo.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
          </article>` : ""}
          </div>
          ${videoId ? `<nav class="gamesense-skin-media-pagination" aria-label="Choose weapon skin video">
            <button type="button" class="is-active" data-skin-media-page-button="0" aria-label="Show skin animation" aria-pressed="true"></button>
            <button type="button" data-skin-media-page-button="1" aria-label="Show collection video" aria-pressed="false"></button>
          </nav>` : ""}
        </section>
        <p class="gamesense-skin-preview-dismiss">Click outside the preview to close.</p>
      </div>`;
    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        closeSkinPreview();
        return;
      }
      const selector = event.target.closest?.("[data-skin-preview-view]");
      if (selector) {
        const index = Number(selector.dataset.skinPreviewView || 0);
        setActiveSkinView(index);
        setActiveSkinModel(overlay, variants[index], name, weapon);
        setActiveSkinVariantMedia(selector);
      } else {
        const videoSelector = event.target.closest?.("[data-skin-preview-video-option]");
        if (videoSelector) setActiveSkinVideo(Number(videoSelector.dataset.skinPreviewVideoOption || 0), videoSelector);
      }
      const mediaPageButton = event.target.closest?.("[data-skin-media-page-button]");
      if (mediaPageButton) {
        const nextPage = Number(mediaPageButton.dataset.skinMediaPageButton || 0);
        overlay.querySelectorAll("[data-skin-media-page]").forEach((page) => {
          const isActive = Number(page.dataset.skinMediaPage || 0) === nextPage;
          page.hidden = !isActive;
          page.classList.toggle("is-active", isActive);
        });
        overlay.querySelectorAll("[data-skin-media-page-button]").forEach((button) => {
          const isActive = Number(button.dataset.skinMediaPageButton || 0) === nextPage;
          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
        const nativeVideo = overlay.querySelector("[data-skin-preview-video]");
        if (nativeVideo && nextPage !== 0) nativeVideo.pause?.();
      }
    });
    document.body.appendChild(overlay);
    if (window.matchMedia("(max-width: 820px)").matches) {
      document.body.classList.add("mobile-modal-open");
    }
    activeSkinPreview = overlay;
    const staticStage = overlay.querySelector(".gamesense-skin-model-stage.is-static");
    if (staticStage) {
      resetStaticSkinInspect(staticStage);
      bindStaticSkinInspect(staticStage);
    }
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    overlay.focus({ preventScroll: true });
  }

  function renderDetail(topic, itemId) {
    const item = getTopicItems(topic).find(entry => entry.id === itemId);
    if (!item) return renderGallery(topic);
    if (topic === "maps") return renderMapDetail(item);
    if (topic === "agents") return renderAgentDetail(item);
    return renderWeaponDetail(item);
  }

  function applyMapZoom(nextZoom, anchor = null) {
    state.mapZoom = Math.max(1, Math.min(3, Math.round(Number(nextZoom || 1) * 10) / 10));
    const viewport = document.querySelector("[data-gamesense-map-viewport]");
    const stage = document.querySelector("[data-gamesense-map-stage]");
    const value = document.querySelector("[data-gamesense-map-zoom-value]");
    if (!viewport || !stage) return;
    const previousWidth = Math.max(1, stage.getBoundingClientRect().width);
    const anchorX = anchor?.x ?? viewport.clientWidth / 2;
    const anchorY = anchor?.y ?? viewport.clientHeight / 2;
    const contentX = (viewport.scrollLeft + anchorX) / previousWidth;
    const contentY = (viewport.scrollTop + anchorY) / previousWidth;
    stage.style.setProperty("--map-zoom", String(state.mapZoom));
    stage.style.setProperty("--map-width", `${state.mapZoom * 100}%`);
    viewport.classList.toggle("is-zoomed", state.mapZoom > 1);
    if (value) value.textContent = `${Math.round(state.mapZoom * 100)}%`;
    requestAnimationFrame(() => {
      const nextWidth = Math.max(1, stage.getBoundingClientRect().width);
      viewport.scrollLeft = Math.max(0, (contentX * nextWidth) - anchorX);
      viewport.scrollTop = Math.max(0, (contentY * nextWidth) - anchorY);
    });
  }

  function bindMapPanZoom() {
    const viewport = document.querySelector("[data-gamesense-map-viewport]");
    if (!viewport || viewport.dataset.panZoomBound === "true") return;
    viewport.dataset.panZoomBound = "true";
    const pointers = new Map();
    let dragging = false;
    let dragPointerId = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let pinchDistance = 0;
    let pinchZoom = state.mapZoom;
    const pointerDistance = values => Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
    const beginDrag = pointer => {
      dragging = state.mapZoom > 1;
      dragPointerId = pointer.id;
      startX = pointer.x;
      startY = pointer.y;
      startLeft = viewport.scrollLeft;
      startTop = viewport.scrollTop;
      viewport.classList.toggle("is-grabbing", dragging);
    };
    viewport.addEventListener("pointerdown", event => {
      if (event.target?.closest?.("button,a,summary")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
      try {
        viewport.setPointerCapture?.(event.pointerId);
      } catch (_error) {
        // Pointer capture can fail after an interrupted touch; dragging still works without it.
      }
      const values = [...pointers.values()];
      if (values.length === 1) beginDrag(values[0]);
      if (values.length === 2) {
        dragging = false;
        viewport.classList.remove("is-grabbing");
        pinchDistance = pointerDistance(values);
        pinchZoom = state.mapZoom;
      }
    });
    viewport.addEventListener("pointermove", event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
      const values = [...pointers.values()];
      if (values.length >= 2 && pinchDistance) {
        event.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const centerX = ((values[0].x + values[1].x) / 2) - rect.left;
        const centerY = ((values[0].y + values[1].y) / 2) - rect.top;
        applyMapZoom(pinchZoom * (pointerDistance(values) / pinchDistance), { x: centerX, y: centerY });
        return;
      }
      if (!dragging || dragPointerId !== event.pointerId || state.mapZoom <= 1) return;
      event.preventDefault();
      viewport.scrollLeft = startLeft - (event.clientX - startX);
      viewport.scrollTop = startTop - (event.clientY - startY);
    });
    const stopPointer = event => {
      pointers.delete(event.pointerId);
      pinchDistance = 0;
      const remaining = [...pointers.values()];
      if (remaining.length === 1) beginDrag(remaining[0]);
      else {
        dragging = false;
        dragPointerId = null;
        viewport.classList.remove("is-grabbing");
      }
    };
    viewport.addEventListener("pointerup", stopPointer);
    viewport.addEventListener("pointercancel", stopPointer);
    viewport.addEventListener("dragstart", event => event.preventDefault());
  }

  function selectCompAgent(compAgentButton) {
    const selectedAgent = String(compAgentButton?.dataset?.gamesenseCompAgent || "").trim();
    if (!selectedAgent) return;
    state.compAgent = selectedAgent;

    const compCard = compAgentButton.closest(".gamesense-comp-card");
    compCard?.querySelectorAll("[data-gamesense-comp-agent]").forEach(button => {
      const isSelected = button.dataset.gamesenseCompAgent === selectedAgent;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    const map = getMaps().find(item => item.id === state.itemId);
    const insight = map?.agentInsights?.[selectedAgent] || "No current composition note is available for this agent.";
    let read = compCard?.querySelector(".gamesense-comp-agent-read");
    if (!read) {
      read = document.createElement("div");
      read.className = "gamesense-comp-agent-read is-revealing";
      compCard?.querySelector(".gamesense-comp-prompt")?.replaceWith(read);
    }
    if (read) {
      const replacement = document.createElement("template");
      replacement.innerHTML = renderCompAgentRead(map, selectedAgent, insight);
      read.replaceWith(replacement.content.firstElementChild);
      read = compCard?.querySelector(".gamesense-comp-agent-read");
    }

    if (document.documentElement.classList.contains("is-mobile-layout")) {
      requestAnimationFrame(() => window.setTimeout(() => read?.scrollIntoView({ behavior: "smooth", block: "center" }), 60));
    }
  }

  function selectCompRole(roleButton) {
    const map = getMaps().find(item => item.id === state.itemId);
    const explorer = roleButton?.closest(".gamesense-comp-pick-explorer");
    const selectedRole = String(roleButton?.dataset?.gamesenseCompRole || "");
    if (!map || !explorer || !["Controller", "Duelist", "Initiator", "Sentinel"].includes(selectedRole)) return;
    state.compRole = selectedRole;
    explorer.querySelectorAll("[data-gamesense-comp-role]").forEach(button => {
      const isSelected = button.dataset.gamesenseCompRole === selectedRole;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    replaceTargetedElement(explorer.querySelector(".gamesense-comp-pick-list"), renderCompRolePickList(map, selectedRole));
  }

  function togglePlantPreview(toggle) {
    const row = toggle?.closest(".gamesense-plant-row");
    const legend = row?.closest(".gamesense-plant-legend");
    const preview = row?.querySelector(".gamesense-plant-preview");
    if (!row || !legend || !preview) return;
    const shouldOpen = preview.hidden;
    legend.querySelectorAll(".gamesense-plant-row").forEach(item => {
      const itemPreview = item.querySelector(".gamesense-plant-preview");
      const itemToggle = item.querySelector(".gamesense-plant-preview-toggle");
      if (itemPreview) itemPreview.hidden = true;
      item.classList.remove("has-preview-open");
      itemToggle?.setAttribute("aria-expanded", "false");
      if (itemToggle) itemToggle.textContent = "+";
    });
    if (shouldOpen) {
      preview.hidden = false;
      row.classList.add("has-preview-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.textContent = "-";
    }
  }

  function replaceTargetedElement(element, markup) {
    if (!element || !markup) return null;
    const template = document.createElement("template");
    template.innerHTML = markup.trim();
    const replacement = template.content.firstElementChild;
    if (!replacement) return null;
    element.replaceWith(replacement);
    return replacement;
  }

  function selectAbility(abilityButton) {
    const selectedAbility = String(abilityButton?.dataset?.gamesenseAbility || "").trim();
    const agent = getReference().agents?.find(item => item.id === state.itemId);
    const ability = agent?.abilities?.find(item => item.id === selectedAbility);
    const section = abilityButton?.closest(".gamesense-selector-section");
    if (!ability || !section) return;
    state.detailId = selectedAbility;
    section.querySelectorAll("[data-gamesense-ability]").forEach(button => {
      const isSelected = button.dataset.gamesenseAbility === selectedAbility;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    replaceTargetedElement(section.querySelector(".gamesense-ability-video-slot"), renderAbilityVideoSlot(ability));
    replaceTargetedElement(section.querySelector(".gamesense-ability-panel"), renderAbilityDetail(agent, ability, { includeVideo: false }));
  }

  function selectWeapon(weaponButton) {
    const selectedWeapon = String(weaponButton?.dataset?.gamesenseWeapon || "").trim();
    const group = getReference().weapons?.find(item => item.id === state.itemId);
    const weapon = group?.weapons?.find(item => item.id === selectedWeapon);
    const section = weaponButton?.closest(".gamesense-selector-section");
    if (!weapon || !section) return;
    state.detailId = selectedWeapon;
    section.querySelectorAll("[data-gamesense-weapon]").forEach(button => {
      const isSelected = button.dataset.gamesenseWeapon === selectedWeapon;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    replaceTargetedElement(section.querySelector(".gamesense-weapon-panel"), renderWeaponFact(weapon));
    replaceWeaponCollectionArchive(weapon, getWeaponCollectionProvider()?.getCached(weapon.label), collectionLoadErrors.get(weapon.label) || "");
    hydrateWeaponCollectionArchive(weapon);
  }

  function selectRole(roleButton) {
    const hub = roleButton?.closest(".gamesense-tips-hub");
    const map = getMaps().find(item => item.id === state.itemId);
    if (!hub || !map) return;
    state.role = roleButton.dataset.gamesenseRole === "all" ? "" : roleButton.dataset.gamesenseRole;
    hub.querySelectorAll("[data-gamesense-role]").forEach(button => {
      const buttonRole = button.dataset.gamesenseRole === "all" ? "" : button.dataset.gamesenseRole;
      const isSelected = buttonRole === state.role;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    hub.classList.toggle("has-role-filter", Boolean(state.role));
    if (state.role) hub.dataset.roleTone = state.role.toLowerCase();
    else delete hub.dataset.roleTone;
    const summary = hub.querySelector(".gamesense-role-lens-menu summary strong");
    if (summary) {
      summary.textContent = state.role || "All roles";
      if (state.role) summary.dataset.roleTone = state.role.toLowerCase();
      else delete summary.dataset.roleTone;
    }
    const menu = hub.querySelector(".gamesense-role-lens-menu");
    if (menu) menu.open = false;
    replaceTargetedElement(hub.querySelector(".gamesense-tips-panel"), renderMapTipsPanel(getMapTipsViewModel(map)));
  }

  function setPlantHotspotHighlight(marker, highlighted, persistent = false) {
    const mapRow = marker?.closest(".gamesense-map-canvas-row");
    const key = marker?.dataset?.gamesensePlantKey;
    if (!mapRow || !key) return;
    const legendRow = [...mapRow.querySelectorAll(".gamesense-plant-legend [data-gamesense-plant-key]")]
      .find(item => item.dataset.gamesensePlantKey === key);
    marker.classList.toggle(persistent ? "active" : "is-hotspot-preview", highlighted);
    legendRow?.classList.toggle(persistent ? "active" : "is-hotspot-preview", highlighted);
    const legend = mapRow.querySelector(".gamesense-plant-legend");
    legend?.classList.toggle("has-hotspot-focus", Boolean(mapRow.querySelector(".gamesense-plant-marker:is(.active,.is-hotspot-preview)")));
  }

  function bindPlantHotspots() {
    const markers = [...document.querySelectorAll(".gamesense-plant-marker[data-gamesense-plant-key]")];
    markers.forEach(marker => {
      if (marker.dataset.hotspotBound === "true") return;
      marker.dataset.hotspotBound = "true";
      marker.addEventListener("pointerenter", () => setPlantHotspotHighlight(marker, true));
      marker.addEventListener("pointerleave", () => setPlantHotspotHighlight(marker, false));
      marker.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const shouldActivate = !marker.classList.contains("active");
        markers.forEach(item => setPlantHotspotHighlight(item, false, true));
        if (shouldActivate) setPlantHotspotHighlight(marker, true, true);
      });
    });
  }

  function hydrateFeaturedPlaylist() {
    if (featuredPlaylist || featuredPlaylistRequest) return featuredPlaylistRequest || Promise.resolve(featuredPlaylist);
    featuredPlaylistStatus = "loading";
    featuredPlaylistError = "";
    featuredPlaylistRequest = fetch("/api/content/playlist", { headers: { Accept: "application/json" } })
      .then(response => {
        if (!response.ok) throw new Error(`Featured Playlist returned HTTP ${response.status}.`);
        return response.json();
      })
      .then(payload => {
        featuredPlaylist = payload && Array.isArray(payload.items) ? payload : { items: [], liveStreams: [], newIn24Hours: 0 };
        featuredPlaylistStatus = "ready";
        if (state.topic === "overview") {
          const collage = document.querySelector("#gamesenseLibraryView .gamesense-playlist-topic-card .gamesense-topic-collage");
          if (collage) {
            const template = document.createElement("template");
            template.innerHTML = getTopicCollageMarkup("playlist");
            collage.replaceChildren(template.content);
            scheduleTopicCollageHydration();
          }
        } else if (state.topic === "playlist") {
          render({ direction: "replace" });
        }
      })
      .catch(error => {
        console.warn("Featured Playlist refresh skipped", error?.message || error);
        featuredPlaylist = null;
        featuredPlaylistStatus = "failed";
        featuredPlaylistError = "The latest verified videos could not be reached. Please try again.";
        if (state.topic === "playlist") render({ direction: "replace" });
      })
      .finally(() => { featuredPlaylistRequest = null; });
    return featuredPlaylistRequest;
  }

  function retryFeaturedPlaylist() {
    if (featuredPlaylistRequest) return;
    featuredPlaylist = null;
    featuredPlaylistStatus = "idle";
    featuredPlaylistError = "";
    hydrateFeaturedPlaylist();
    if (state.topic === "playlist") render({ direction: "replace" });
  }

  function commitRender(root) {
    root.innerHTML = state.topic === "overview" ? renderOverview() : state.itemId ? renderDetail(state.topic, state.itemId) : renderGallery(state.topic);
    root.querySelectorAll("img[data-agent-fallback]").forEach(img => {
      img.addEventListener("error", () => {
        const fallback = img.dataset.agentFallback;
        if (fallback && img.src !== fallback) img.src = fallback;
      }, { once: true });
    });
    root.querySelectorAll("img[data-gamesense-map-card-background-fallback]").forEach(img => {
      img.addEventListener("error", () => {
        const fallback = img.dataset.gamesenseMapCardBackgroundFallback;
        const card = img.closest(".gamesense-map-entry-card");
        if (!fallback || !card || img.dataset.gamesenseMapCardFallbackUsed === "true") return;
        img.dataset.gamesenseMapCardFallbackUsed = "true";
        card.style.setProperty("--map-card-image", `url("${fallback.replace(/["\\\n\r]/g, "\\$&")}")`);
      }, { once: true });
    });
    root.querySelectorAll("img[data-gamesense-overview-fallback-src]").forEach(img => {
      img.addEventListener("error", () => {
        const fallback = img.dataset.gamesenseOverviewFallbackSrc;
        if (!fallback || img.dataset.gamesenseOverviewFallbackUsed === "true") return;
        img.dataset.gamesenseOverviewFallbackUsed = "true";
        img.src = fallback;
      }, { once: true });
    });
    root.querySelectorAll("img[data-crosshair-photo-fallback]").forEach(img => {
      img.addEventListener("error", () => {
        img.hidden = true;
        img.closest(".gamesense-crosshair-photo")?.classList.add("is-fallback");
      }, { once: true });
    });
    bindMapPanZoom();
    bindPlantHotspots();
    bindPlaylistFilterScroller();
    hydrateWeaponCollectionArchive();
    if (state.topic === "crosshairs") hydrateCrosshairState();
    if (libraryPageActive) {
      hydrateFeaturedPlaylist();
      hydrateRiotPatchNotes();
    }
    scheduleTopicCollageHydration();
  }

  function bindPlaylistFilterScroller() {
    const filters = document.querySelector(".gamesense-playlist-filters");
    if (!filters || filters.dataset.dragBound === "true") return;
    filters.dataset.dragBound = "true";
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let dragging = false;
    let suppressClickUntil = 0;

    filters.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startScrollLeft = filters.scrollLeft;
      dragging = false;
    });
    filters.addEventListener("pointermove", (event) => {
      if (pointerId !== event.pointerId) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (!dragging && Math.abs(deltaX) < 5) return;
      if (!dragging && Math.abs(deltaX) <= Math.abs(deltaY)) return;
      if (!dragging) {
        dragging = true;
        filters.classList.add("is-dragging");
      }
      filters.scrollLeft = startScrollLeft - deltaX;
      try {
        filters.setPointerCapture?.(pointerId);
      } catch (_error) {
        // Synthetic test gestures and older WebViews may not expose an active pointer capture.
      }
      event.preventDefault();
      event.stopPropagation();
    });
    const finishDrag = (event) => {
      if (pointerId !== event.pointerId) return;
      if (dragging) suppressClickUntil = Date.now() + 260;
      filters.classList.remove("is-dragging");
      try {
        if (filters.hasPointerCapture?.(pointerId)) filters.releasePointerCapture(pointerId);
      } catch (_error) {
        // The browser may have already released capture while handing vertical motion to the page.
      }
      pointerId = null;
      dragging = false;
    };
    filters.addEventListener("pointerup", finishDrag);
    filters.addEventListener("pointercancel", finishDrag);
    filters.addEventListener("click", (event) => {
      if (Date.now() >= suppressClickUntil) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  function render(options = {}) {
    const root = document.getElementById("gamesenseLibraryView");
    if (!root) return;
    const direction = ["forward", "backward", "replace"].includes(options.direction) ? options.direction : "none";
    const shouldAnimate = ["forward", "backward"].includes(direction)
      && !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
      && !document.documentElement.classList.contains("is-mobile-layout")
      && !window.matchMedia?.("(max-width: 820px)")?.matches;
    if (!shouldAnimate) {
      commitRender(root);
      return null;
    }

    activeLibraryTransition?.skipTransition?.();
    document.documentElement.dataset.gamesenseTransition = direction;
    root.style.viewTransitionName = "gamesense-library-content";
    if (typeof document.startViewTransition === "function") {
      const transition = document.startViewTransition(() => commitRender(root));
      transition.ready?.catch(() => {});
      transition.updateCallbackDone?.catch(() => {});
      transition.finished?.catch(() => {});
      activeLibraryTransition = transition;
      transition.finished.catch(() => {}).finally(() => {
        if (activeLibraryTransition === transition) activeLibraryTransition = null;
        delete document.documentElement.dataset.gamesenseTransition;
      });
      return transition;
    }

    commitRender(root);
    const distance = direction === "backward" ? -24 : 24;
    const animation = root.animate([
      { opacity: .45, transform: `translate3d(${distance}px,0,0)` },
      { opacity: 1, transform: "translate3d(0,0,0)" }
    ], { duration: 260, easing: "cubic-bezier(.2,.82,.24,1)" });
    activeLibraryTransition = animation;
    animation.finished.catch(() => {}).finally(() => {
      if (activeLibraryTransition === animation) activeLibraryTransition = null;
      delete document.documentElement.dataset.gamesenseTransition;
    });
    return animation;
  }

  function openLibrary(topic = "overview", itemId = "") {
    state.topic = topicMeta[topic] ? topic : "overview";
    state.itemId = itemId;
    state.role = "";
    state.detailId = "";
    state.mapView = "locations";
    state.tipView = "attack";
    state.mapZoom = 1;
    state.compAgent = "";
    state.compRole = "Controller";
    state.agentRole = "all";
    state.mapSeason = "all";
    state.playlistFilter = "Home";
    state.crosshairTab = "All";
    state.crosshairSort = "desc";
    const desktopNav = document.querySelector('.nav-btn[data-page="library"]');
    const mobileNav = document.querySelector('.mobile-bottom-page-btn[data-mobile-page="library"]');
    const selectedNav = document.documentElement.classList.contains("is-mobile-layout") ? mobileNav : desktopNav;
    if (!selectedNav?.classList.contains("active")) {
      selectedNav?.click();
    }
    render({ direction: itemId || state.topic !== "overview" ? "forward" : "none" });
  }

  function resetLibrary() {
    state.topic = "overview";
    state.itemId = "";
    state.role = "";
    state.detailId = "";
    state.mapView = "locations";
    state.tipView = "attack";
    state.mapZoom = 1;
    state.compAgent = "";
    state.compRole = "Controller";
    state.agentRole = "all";
    state.mapSeason = "all";
    state.playlistFilter = "Home";
    state.crosshairTab = "All";
    state.crosshairSort = "desc";
    render({ direction: "backward" });
    const libraryPage = document.getElementById("page-library");
    const owner = document.documentElement.classList.contains("is-mobile-layout")
      ? document.querySelector(".app-root")
      : libraryPage;
    if (owner) owner.scrollTop = 0;
  }

  function decorateWarmupDrills() {
    const details = getReference().warmupDetails || {};
    document.querySelectorAll("[data-warmup-drill]").forEach(drill => {
      const id = drill.dataset.warmupDrill;
      const steps = details[id];
      if (!Array.isArray(steps) || drill.querySelector("[data-warmup-info]")) return;
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "daily-warmup-info-toggle";
      toggle.dataset.warmupInfo = id;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", `Show ${id.replace(/-/g, " ")} instructions`);
      toggle.textContent = "?";
      const detail = document.createElement("div");
      detail.className = "daily-warmup-info-detail";
      detail.dataset.warmupInfoDetail = id;
      detail.hidden = true;
      detail.innerHTML = `<strong>Run it like this</strong><ol>${steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
      drill.append(toggle, detail);
    });
  }

  function toggleWarmupInfo(toggle) {
    const card = toggle.closest("[data-warmup-drill]");
    const detail = card?.querySelector(`[data-warmup-info-detail="${toggle.dataset.warmupInfo}"]`);
    if (!detail) return;
    const open = detail.hidden;
    detail.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    card.classList.toggle("has-info-open", open);
  }

  function selectCollectionPreview(card) {
    const archive = card?.closest?.(".gamesense-collection-archive");
    (archive || document).querySelectorAll(".gamesense-collection-card.is-selected").forEach(candidate => {
      candidate.classList.remove("is-selected");
    });
    if (card) card.classList.add("is-selected");
  }

  function usesTwoStepCollectionPreview() {
    return document.documentElement.classList.contains("is-mobile-layout")
      || document.body.classList.contains("is-touch-layout");
  }

  document.addEventListener("touchstart", event => {
    const trigger = event.target.closest?.("[data-gamesense-collection-preview]");
    const touch = event.touches?.[0];
    skinPreviewTouchActivation = trigger && event.touches?.length === 1 && touch
      ? {
          trigger,
          identifier: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          startedAt: Date.now()
        }
      : null;
  }, { capture: true, passive: true });

  document.addEventListener("touchend", event => {
    const activation = skinPreviewTouchActivation;
    skinPreviewTouchActivation = null;
    if (!activation?.trigger?.isConnected) return;
    const touch = Array.from(event.changedTouches || []).find(item => item.identifier === activation.identifier);
    if (!touch) return;
    const distance = Math.hypot(touch.clientX - activation.x, touch.clientY - activation.y);
    const elapsed = Date.now() - activation.startedAt;
    const rect = activation.trigger.getBoundingClientRect();
    const endedInside = touch.clientX >= rect.left && touch.clientX <= rect.right
      && touch.clientY >= rect.top && touch.clientY <= rect.bottom;
    if (distance > 16 || elapsed > 800 || !endedInside) return;
    event.preventDefault();
    event.stopPropagation();
    if (activation.trigger.classList.contains("is-selected")) {
      openSkinPreview(activation.trigger);
      return;
    }
    selectCollectionPreview(activation.trigger);
  }, { capture: true, passive: false });

  document.addEventListener("touchcancel", () => {
    skinPreviewTouchActivation = null;
  }, { capture: true, passive: true });

  document.addEventListener("click", event => {
    const libraryNav = event.target.closest?.('.nav-btn[data-page="library"], .mobile-bottom-page-btn[data-mobile-page="library"]');
    const anyPageNav = event.target.closest?.(".nav-btn[data-page], .mobile-bottom-page-btn[data-mobile-page]");
    if (anyPageNav && activeMediaPlayer) closeMediaPlayer();
    if (libraryNav?.classList.contains("active") && state.topic !== "overview") {
      resetLibrary();
      return;
    }
    const warmupToggle = event.target.closest?.("[data-warmup-info]");
    if (warmupToggle) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleWarmupInfo(warmupToggle);
      return;
    }
    const contextual = event.target.closest?.("[data-gamesense-open]");
    if (contextual) {
      event.preventDefault();
      openLibrary(contextual.dataset.gamesenseOpen, contextual.dataset.gamesenseItemTarget || "");
      return;
    }
    const topic = event.target.closest?.("[data-gamesense-topic]");
    if (topic) {
      state.topic = topic.dataset.gamesenseTopic;
      state.itemId = "";
      state.role = "";
      state.detailId = "";
      state.mapView = "locations";
      state.tipView = "attack";
      state.mapZoom = 1;
      state.compAgent = "";
      state.compRole = "Controller";
      state.crosshairTab = "All";
      state.crosshairSort = "desc";
      if (state.topic === "maps") state.mapSeason = "all";
      render({ direction: "forward" });
      return;
    }
    const item = event.target.closest?.("[data-gamesense-item]");
    if (item) {
      state.itemId = item.dataset.gamesenseItem;
      state.role = "";
      state.detailId = "";
      state.mapView = "locations";
      state.tipView = "attack";
      state.mapZoom = 1;
      state.compAgent = "";
      state.compRole = "Controller";
      render({ direction: "forward" });
      return;
    }
    const agentRoleFilter = event.target.closest?.("[data-gamesense-agent-role-filter]");
    if (agentRoleFilter) {
      state.agentRole = ["all", "duelist", "controller", "initiator", "sentinel"].includes(agentRoleFilter.dataset.gamesenseAgentRoleFilter)
        ? agentRoleFilter.dataset.gamesenseAgentRoleFilter
        : "all";
      render({ direction: "replace" });
      return;
    }
    const mapSeason = event.target.closest?.("[data-gamesense-map-season]");
    if (mapSeason) {
      state.mapSeason = ["in", "out"].includes(mapSeason.dataset.gamesenseMapSeason)
        ? mapSeason.dataset.gamesenseMapSeason
        : "in";
      render({ direction: "replace" });
      return;
    }
    const playlistFilter = event.target.closest?.("[data-gamesense-playlist-filter]");
    if (playlistFilter) {
      state.playlistFilter = normalizePlaylistFilter(playlistFilter.dataset.gamesensePlaylistFilter);
      render({ direction: "replace" });
      return;
    }
    const playlistRetry = event.target.closest?.("[data-gamesense-playlist-retry]");
    if (playlistRetry) {
      event.preventDefault();
      retryFeaturedPlaylist();
      return;
    }
    const playlistAutoplay = event.target.closest?.("[data-gamesense-playlist-autoplay]");
    if (playlistAutoplay) {
      event.preventDefault();
      const category = normalizePlaylistFilter(playlistAutoplay.dataset.gamesensePlaylistAutoplay);
      const enabled = !getPlaylistAutoplayEnabled(category);
      setPlaylistAutoplayEnabled(category, enabled);
      render({ direction: "replace" });
      return;
    }
    const crosshairTab = event.target.closest?.("[data-gamesense-crosshair-tab]");
    if (crosshairTab) {
      state.crosshairTab = normalizeCrosshairTab(crosshairTab.dataset.gamesenseCrosshairTab);
      render({ direction: "replace" });
      return;
    }
    const crosshairTeam = event.target.closest?.("[data-gamesense-crosshair-team]");
    if (crosshairTeam) {
      state.crosshairTeam = crosshairTeam.dataset.gamesenseCrosshairTeam || "All teams";
      render({ direction: "replace" });
      return;
    }
    const crosshairSort = event.target.closest?.("[data-gamesense-crosshair-sort]");
    if (crosshairSort) {
      state.crosshairSort = crosshairSort.dataset.gamesenseCrosshairSort === "asc" ? "asc" : "desc";
      render({ direction: "replace" });
      return;
    }
    const crosshairCopy = event.target.closest?.("[data-gamesense-crosshair-copy]");
    if (crosshairCopy) {
      event.preventDefault();
      copyCrosshairCode(crosshairCopy.dataset.gamesenseCrosshairCopy || "");
      return;
    }
    const crosshairLike = event.target.closest?.("[data-gamesense-crosshair-like]");
    if (crosshairLike) {
      event.preventDefault();
      void toggleCrosshairRelation("crosshair_likes", crosshairLike.dataset.gamesenseCrosshairLike || "", "like crosshairs");
      return;
    }
    const crosshairFavorite = event.target.closest?.("[data-gamesense-crosshair-favorite]");
    if (crosshairFavorite) {
      event.preventDefault();
      void toggleCrosshairRelation("crosshair_favorites", crosshairFavorite.dataset.gamesenseCrosshairFavorite || "", "save favorite crosshairs");
      return;
    }
    const externalLive = event.target.closest?.("[data-gamesense-open-live]");
    if (externalLive) {
      const url = String(externalLive.dataset.gamesenseOpenLive || "");
      if (/^https:\/\/(?:www\.)?(?:twitch\.tv|youtube\.com)\//i.test(url)) window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    const playlistVideo = event.target.closest?.("[data-gamesense-play-video]");
    if (playlistVideo) {
      event.preventDefault();
      event.stopPropagation();
      const videoId = String(playlistVideo.dataset.gamesensePlayVideo || "");
      if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;
      const video = [
        ...getPlaylistCatalogItems(),
        ...(featuredPlaylist?.liveStreams || [])
      ].find(item => String(item?.id || "") === videoId) || {};
      const category = normalizePlaylistFilter(playlistVideo.closest("[data-gamesense-playlist-category]")?.dataset.gamesensePlaylistCategory || "");
      openPlaylistVideo(video, {
        autoplayCategory: category,
        autoplayQueue: getPlaylistAutoplayQueue(category)
      });
      return;
    }
    const twitchLive = event.target.closest?.("[data-gamesense-play-twitch]");
    if (twitchLive) {
      event.preventDefault();
      event.stopPropagation();
      const channel = String(twitchLive.dataset.gamesensePlayTwitch || "");
      if (!/^[A-Za-z0-9_]{1,25}$/.test(channel)) return;
      const stream = (featuredPlaylist?.liveStreams || []).find(item => getTwitchChannel(item).toLowerCase() === channel.toLowerCase()) || {};
      openMediaPlayer({
        platform: "twitch",
        channel,
        title: stream.title || `${channel} live on Twitch`,
        url: stream.url || `https://www.twitch.tv/${channel}`
      });
      return;
    }
    const twitchArchive = event.target.closest?.("[data-gamesense-play-twitch-video]");
    if (twitchArchive) {
      event.preventDefault();
      event.stopPropagation();
      const videoId = String(twitchArchive.dataset.gamesensePlayTwitchVideo || "");
      if (!/^\d+$/.test(videoId)) return;
      const video = (featuredPlaylist?.items || []).find(item => String(item?.upstreamId || "") === videoId) || {};
      openMediaPlayer({
        platform: "twitch",
        videoId,
        title: video.title || "Twitch past broadcast",
        url: video.url || `https://www.twitch.tv/videos/${videoId}`
      });
      return;
    }
    const mapView = event.target.closest?.("[data-gamesense-map-view]");
    if (mapView) {
      state.mapView = ["locations", "plants", "heatmap"].includes(mapView.dataset.gamesenseMapView)
        ? mapView.dataset.gamesenseMapView
        : "locations";
      render({ direction: "replace" });
      return;
    }
    const tipView = event.target.closest?.("[data-gamesense-tip-view]");
    if (tipView) {
      state.tipView = ["attack", "defense", "sites", "teamplay"].includes(tipView.dataset.gamesenseTipView) ? tipView.dataset.gamesenseTipView : "attack";
      render({ direction: "replace" });
      return;
    }
    const mapZoom = event.target.closest?.("[data-gamesense-map-zoom]");
    if (mapZoom) {
      const action = mapZoom.dataset.gamesenseMapZoom;
      applyMapZoom(action === "in" ? state.mapZoom + .25 : action === "out" ? state.mapZoom - .25 : 1);
      return;
    }
    const compAgent = event.target.closest?.("[data-gamesense-comp-agent]");
    if (compAgent) {
      selectCompAgent(compAgent);
      return;
    }
    const compRole = event.target.closest?.("[data-gamesense-comp-role]");
    if (compRole) {
      selectCompRole(compRole);
      return;
    }
    const plantPreview = event.target.closest?.("[data-gamesense-plant-preview]");
    if (plantPreview) {
      event.preventDefault();
      event.stopPropagation();
      togglePlantPreview(plantPreview);
      return;
    }
    const role = event.target.closest?.("[data-gamesense-role]");
    if (role) {
      selectRole(role);
      return;
    }
    const ability = event.target.closest?.("[data-gamesense-ability]");
    if (ability) {
      selectAbility(ability);
      return;
    }
    const damageRange = event.target.closest?.("[data-gamesense-damage-range]");
    if (damageRange) {
      const table = damageRange.closest(".gamesense-damage-table");
      const activeIndex = damageRange.dataset.gamesenseDamageRange;
      table?.querySelectorAll("[data-gamesense-damage-range]").forEach(button => {
        const active = button.dataset.gamesenseDamageRange === activeIndex;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      table?.querySelectorAll("[data-gamesense-damage-range-panel]").forEach(panel => {
        panel.classList.toggle("is-mobile-range-active", panel.dataset.gamesenseDamageRangePanel === activeIndex);
      });
      return;
    }
    const collectionPreview = event.target.closest?.("[data-gamesense-collection-preview]");
    if (collectionPreview) {
      event.preventDefault();
      event.stopPropagation();
      if (usesTwoStepCollectionPreview() && !collectionPreview.classList.contains("is-selected")) {
        selectCollectionPreview(collectionPreview);
        return;
      }
      openSkinPreview(collectionPreview);
      return;
    }
    const collectionRetry = event.target.closest?.("[data-gamesense-collection-retry]");
    if (collectionRetry) {
      event.preventDefault();
      hydrateWeaponCollectionArchive(getSelectedWeapon(), { retry: true });
      return;
    }
    const collectionFilter = event.target.closest?.("[data-gamesense-collection-filter]");
    if (collectionFilter) {
      const archive = collectionFilter.closest(".gamesense-collection-archive");
      const filter = collectionFilter.dataset.gamesenseCollectionFilter || "all";
      archive?.querySelectorAll("[data-gamesense-collection-filter]").forEach(button => {
        const active = button.dataset.gamesenseCollectionFilter === filter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      archive?.querySelectorAll("[data-gamesense-collection-tier]").forEach(card => {
        card.hidden = filter !== "all" && card.dataset.gamesenseCollectionTier !== filter;
      });
      return;
    }
    const weapon = event.target.closest?.("[data-gamesense-weapon]");
    if (weapon) {
      selectWeapon(weapon);
      return;
    }
    const back = event.target.closest?.("[data-gamesense-back]");
    if (back) {
      state.topic = back.dataset.gamesenseBack;
      state.itemId = "";
      state.role = "";
      state.detailId = "";
      state.mapView = "locations";
      state.tipView = "attack";
      state.mapZoom = 1;
      state.compAgent = "";
      state.compRole = "Controller";
      render({ direction: "backward" });
    }
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && activeMediaPlayer) {
      event.preventDefault();
      closeMediaPlayer();
      return;
    }
    if (event.key === "Escape" && activeSkinPreview) {
      event.preventDefault();
      closeSkinPreview();
      return;
    }
    const collectionPreview = event.target.closest?.("[data-gamesense-collection-preview]");
    if (collectionPreview && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (usesTwoStepCollectionPreview() && !collectionPreview.classList.contains("is-selected")) {
        selectCollectionPreview(collectionPreview);
      } else {
        openSkinPreview(collectionPreview);
      }
      return;
    }
    const toggle = event.target.closest?.("[data-warmup-info]");
    if (toggle && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      toggleWarmupInfo(toggle);
    }
  });

  document.addEventListener("pointerdown", event => {
    if (!activeSkinPreview || event.target.closest?.(".gamesense-skin-preview-card")) return;
    closeSkinPreview();
  }, true);

  window.addEventListener("rankedcoach:skin-media-updated", event => {
    const weapon = getSelectedWeapon();
    if (!weapon || weapon.label !== event.detail?.weaponName) return;
    replaceWeaponCollectionArchive(weapon, getWeaponCollectionProvider()?.getCached(weapon.label));
  });

  window.addEventListener("rankedcoach:knowledge-updated", () => {
    void hydratePublishedKnowledge({ force: true });
  });

  window.addEventListener("rankedcoach:daily-entrance-finished", (event) => {
    if (event.detail?.pageId !== "library" || !overviewRefreshQueued) return;
    window.requestAnimationFrame(() => requestOverviewRefresh());
  });

  window.addEventListener("rankedcoach:playlist-watch-history-updated", () => {
    syncPlaylistWatchedPills();
  });

  decorateWarmupDrills();
  render();
  globalThis.RankedCoachGamesenseLibrary = Object.freeze({
    open: openLibrary,
    render,
    reset: resetLibrary,
    setPageActive: setLibraryPageActive,
    getPublishedKnowledge: () => publishedKnowledge.slice()
  });
})();
