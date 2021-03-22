'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "131feaf852826165c4d7992df16269ac",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "27206588da6d3d24f71ec64067b75eb0",
"assets/images/absent_b.jpg": "7c540cf1fba1145e7eb98c2e13ce860c",
"assets/images/absent_s.jpg": "afd0896eb41dbbf7750f62f41e429a9a",
"assets/images/altinbasraki_b.jpg": "cc1bdce7310a0c6f0d544f892b795907",
"assets/images/altinbasraki_s.jpg": "5282a4451d0ad993713655a0607bb561",
"assets/images/bira_b.jpg": "db30475d6986545ee116f3ce8b48fe31",
"assets/images/bira_s.jpg": "243b13a19a322d377339fd065a946f81",
"assets/images/cin_b.jpg": "fbcb3cb82e95428672469fc380799296",
"assets/images/cin_s.jpg": "2ca372cc8d011d8f86754ad484eaadaf",
"assets/images/jager_b.jpg": "eb69648e0498e7ecef7e7dadd4540767",
"assets/images/jager_s.jpg": "70cc2ad035fbcd7118b2975ae80f6ef4",
"assets/images/konyak_b.jpg": "35c1db2116633bc00583452ab03ab3f4",
"assets/images/konyak_s.jpg": "c9b1730b63d1175b9ff321a325c44f29",
"assets/images/likor_b.jpg": "915dadefccd43c2e726a2cbfdc49b9ae",
"assets/images/likor_s.jpg": "ec9869ebe809f1e56f6c4184c45e8b54",
"assets/images/raki_b.jpg": "5dc0554e9b1b77e08d7876a01ecd9380",
"assets/images/raki_s.jpg": "a49b48b682262cd58b7dd8048fcc683d",
"assets/images/rom_b.jpg": "ff66243a157cd9aadffcaec6fc51b4f8",
"assets/images/rom_s.jpg": "9cdf5a349884a2c9ab66c260fcaab69f",
"assets/images/sans.jpg": "b5e4be5ccffdf976916ee064344f0c76",
"assets/images/tekila_b.jpg": "a5d37d6cc1e88bb1ab68f62f5af15839",
"assets/images/tekila_s.jpg": "ca251a4ca2ca5998924b48858e9d1dec",
"assets/images/viski_b.jpg": "724495d5d6e0e79a96d1242aab32dbb9",
"assets/images/viski_s.jpg": "066a336e80565f4637560b1077c554c8",
"assets/images/vodka_b.jpg": "31d3b18c3d97d6b37b9c551db8025e7b",
"assets/images/vodka_s.jpg": "2f78932bf051509af5463854c21977df",
"assets/NOTICES": "39ef6ae006d7591fd6258d5520eb9e7d",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "68ed9133f23f9c7c02a2251e1e7bcb8e",
"/": "68ed9133f23f9c7c02a2251e1e7bcb8e",
"main.dart.js": "9ffd7faae64dd503e567285c1d3f7167",
"manifest.json": "3124cc37a02da532dac43c39da92b45b",
"version.json": "aa957f79ec32d7d482c890bd12687d8d"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
