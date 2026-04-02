# Ideas Log

> Maintained by the `brainstorm` skill. Every idea discussed — pursued or parked — lives here permanently.
> Use the `/brainstorm` skill to add or revisit ideas. Use the `/prd` skill to plan an idea you're ready to build.

| Status | App Name | One-liner | Notes |
|---|---|---|---|
| 🟢 In Progress | Counter | A simple increment/decrement counter | First app — scaffold complete |
| 💡 Idea | Place in Time | Enter a location + date and browse geotagged public photos from that exact spot and moment — no facial recognition, just place + time | Sourced from Flickr/Wikimedia geotagged public photos; pure discovery, no biometrics |
| 💡 Idea | Background Strangers | Upload your own photos and find recurring faces across your trips — who keeps showing up without you noticing? | Client-side ML (face-api.js) so photos never leave the browser; flip of the "find me in others' photos" concept |
| 🔭 Future | Place in Time — Social Photo Layer | Unlock Instagram/Google Maps photos as a richer source for Place in Time by reverse engineering internal APIs | **Instagram**: bellingcat/instagram-location-search maps lat/lon → Instagram location IDs → public photos; requires user's own session cookies; fragile + ToS grey area. **Google Maps**: all photo endpoints require paid API key, no stable tokenless access. **Approach**: capture HAR from browser session on these platforms, extract internal endpoints/tokens, bake into app. Revisit when POC is proven and we're ready to accept maintenance burden. |
