# Assignment 5: The Reliquary of Hanzo
**Jon Cody** - jdcody@ucsc.edu

## Notes to Grader:
All requirements for Assignment 5 have been successfully implemented using the **Three.js** library. This project creates a cinematic, high-performance Japanese shrine environment ("The Reliquary of Hanzo") featuring intricate lighting, custom 3D assets, and optimized procedural elements.

**Key Technical Features:**
*   **Performance Optimization (Geometry Merging):** To maintain high FPS with a dense forest, I implemented `BufferGeometryUtils.mergeGeometries`. Each of the 20+ cherry blossom trees is rendered as just two draw calls (one for wood, one for blossoms) instead of hundreds of individual meshes.
*   **Collision-Aware Snowfall:** Implemented a physics-based particle system where 15,000 snowflakes fall from a 400-unit ceiling. The system includes logic to detect the shrine's roof footprint, preventing snow from falling "through" the architecture into the interior.
*   **Custom Animation Path:** The ancient Tsuba relic follows a vertical **Infinity Symbol (Lemniscate of Gerono)** mathematical path while simultaneously revolving on three axes.
*   **Material Sophistication:** Utilized `MeshPhysicalMaterial` for high-quality rendering, including a "clearcoat" layer on the Jade Dragons and the Tsuba to capture sharp specular highlights from the flickering lantern.
*   **Dynamic Atmosphere:** Features a "candlelight" flicker effect on the Chōchin lantern, where both the `PointLight` intensity and the sphere's `emissiveIntensity` are modulated with randomized noise to simulate a living flame.

## Awesomeness (Creativity):
1.  **The Chōchin Lantern:** Instead of a simple light source, I designed a traditional Japanese paper lantern using a central glowing sphere capped with thickened wooden cylinders. It acts as the primary focal point, casting a warm amber glow over the Hanzo sword.
2.  **Snow Accumulation & Fade:** In addition to the falling snow, I implemented a "Landed Snow" system of 25,000 ground particles that pulse in opacity, simulating the natural cycle of fresh snow landing and slowly melting.
3.  **Winding Dirt Path:** Created an organic, winding trail leading to the shrine using 22 textured circular segments. I implemented a microscopic Y-offset (Z-fighting fix) to ensure the overlapping segments do not flicker when moving the camera.
4.  **Thematic Integration:** Every asset supports the narrative of a hidden mountain reliquary—from the frosty "Sakura" cherry blossoms to the twin Jade Dragon guardians and the floating ancient sword guard (Tsuba).
5.  **Performance HUD:** Integrated a custom real-time stats counter in the bottom right that monitors frame timing (ms) and FPS to demonstrate the efficiency of the geometry merging logic.

## Controls:
*   **Orbit:** `Left Click + Drag`
*   **Pan:** `Right Click + Drag`
*   **Zoom:** `Scroll Wheel`
*   **Navigation:** Managed via Three.js `OrbitControls` with added damping for a smooth, cinematic feel.

## Directory Structure:
```text
.
├── src
│   ├── asgn5.html
│   ├── asgn5.js
│   ├── asgn5.css
│   ├── grass.png                     <-- Ground Texture
│   ├── dirt.png                      <-- Path/Stairs Texture
│   ├── dragon.obj                    <-- Guardian Models
│   ├── tsuba.glb                     <-- Artifact Model
│   └── sword_of_hattori_hanzo...glb  <-- Main Relic Model
└── README.md
```

## How to Run:
1.  Navigate to the `src` directory.
2.  **Server Requirement:** Due to CORS restrictions for loading 3D models (.glb/.obj), you **must** use a local server (e.g., `python3 -m http.server` or VS Code "Live Server"). 
3.  Ensure your browser supports WebGL 2.0.

## Features Implemented (Rubric Checklist):
- [x] **20+ 3D Primary Shapes:** Foundation, 8 stairs, 4 pillars, 3 roof tiers, 3 lantern parts, and 22 path segments.
- [x] **Textured Shape:** Stairs and path utilize the `dirt.jpg` texture mapping.
- [x] **Animated Shape:** The lantern sphere rotates on its Y-axis while its light flickers.
- [x] **3 Shape Varieties:** Used Box, Cylinder, Sphere, and Circle geometries.
- [x] **Textured 3D Model:** Loaded the Hattori Hanzo Sword (.glb), Ancient Tsuba (.glb), and Jade Dragons (.obj).
- [x] **3+ Light Sources:** Ambient, Hemisphere, Directional (Moon & Rim), and Point Lights (Lamp & Orb).
- [x] **Textured Skybox:** CubeMap implemented using the Milky Way texture set.
- [x] **Perspective Camera:** Positioned to frame the shrine and background.
- [x] **Mouse Controls:** Full navigation via OrbitControls.
- [x] **Wow Point:** Optimized the scene via Geometry Merging and implemented "Collision-Aware" Snowfall that respects architectural bounds.
