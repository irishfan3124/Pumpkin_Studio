# Pumpkin Studio

A browser-based jack-o’-lantern designer prepared for public GitHub Pages hosting. Three.js renders the actual generated mesh, and Manifold performs hollowing and face subtraction in a Web Worker. No uploaded designs are sent to a server. Deployment instructions are in the project root README.

## Run

Install Node.js 22 or later, then run `npm install`, `npm run build`, and `npm run dev`. Open http://127.0.0.1:5173. Use `npm test` for mesh connectivity, manifold reconstruction, closed-edge checks, body/lid interference, binary STL serialization, and raster contour tests.

## Features

- Procedural irregular ribs, flattened base, curved stem, normal-offset hollow interior.
- SVG, PNG, JPEG, and WebP silhouette import with threshold and inversion controls.
- Adjustable width, height, rib count, face size/height, wall thickness, and lid clearance.
- Live assembled, exploded-lid, and body views, orbit controls, and LED illumination preview.
- Separate binary STL body and integrated lid/stem, or a ZIP with both files and printing notes.
- Detached-component detection blocks unsuitable exports.

## Design limits

The pumpkin is a procedural approximation of a natural pumpkin, not a scanned specimen. Wall thickness uses a normal-offset triangulated surface; curvature, base, and lid joint can affect local thickness. Check thin walls and overhangs in a slicer. Imported artwork is traced at 256 × 256 pixels, so very fine details and tiny islands should be simplified. SVGs must be self-contained shapes and paths. Artwork is projected through the front half of the pumpkin; preview placement before exporting. STL dimensions are millimeters.

No physical print has been verified. Fit varies with material and printer calibration. Print a fit test and inspect supports. **Use battery-powered LEDs only, never an open flame.**
