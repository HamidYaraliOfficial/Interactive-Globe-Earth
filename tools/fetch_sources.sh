#!/usr/bin/env bash
# Downloads the source datasets used by build_data.py into tools/cache and /tmp
set -e; cd "$(dirname "$0")"; mkdir -p cache
B=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
for f in ne_50m_admin_0_countries ne_10m_admin_1_states_provinces ne_10m_populated_places ne_10m_rivers_lake_centerlines_scale_rank ne_10m_lakes ne_10m_geography_regions_elevation_points ne_10m_geography_regions_polys ne_10m_geography_marine_polys; do [ -s cache/$f.geojson ] || curl -sL -o cache/$f.geojson $B/$f.geojson; done
curl -sL -o /tmp/mle.json https://raw.githubusercontent.com/mledoze/countries/master/countries.json
