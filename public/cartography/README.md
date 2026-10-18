# Historical state borders of Europe (Camada Histórica)

`europe-states.geojson` is derived from **CShapes 2.0** (https://icr.ethz.ch/data/cshapes/):

> Schvitz, Guy, Seraina Rüegger, Luc Girardin, Lars-Erik Cederman, Nils Weidmann, and Kristian Skrede Gleditsch. 2022.
> "Mapping The International System, 1886-2017: The CShapes 2.0 Dataset." *Journal of Conflict Resolution* 66(1): 144–61.

CShapes is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License
(https://creativecommons.org/licenses/by-nc-sa/4.0/). This derived file is distributed under the same license. The
license covers this folder's data only, not the rest of the repository.

Changes from the source, made by `scripts/build-cartography.mts`:

- clipped to Europe (longitude −25 to 60, latitude 33 to 72), and states with no part inside dropped;
- simplified with mapshaper (10% of vertices kept, shapes kept);
- only three fields kept: `name` (from `cntry_name`) and `start`/`end`, the first and last day each version of a
  state's border was valid (from the `gws*`/`gwe*` year, month and day fields).

CShapes maps independent states (the Gleditsch–Ward list). Territories that were no state's on a given day, such as
Germany between May 1945 and the founding of the two German states in 1949, have no polygon on that day. State names
are the source's, in English.
