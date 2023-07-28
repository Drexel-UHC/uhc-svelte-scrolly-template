<!-- 
  # ============================================================================ #
  #  ............... script ...............
-->

<script>
  // # ============================================================================ #
  // 1. Core imports
  import { setContext, onMount } from 'svelte';
  import { getMotion } from './utils.js';
  import { themes } from './config.js';
  import UHCHeader from './layout/UHCHeader.svelte';
  import UHCFooter from './layout/UHCFooter.svelte';
  import Header from './layout/Header.svelte';
  import Section from './layout/Section.svelte';
  import Media from './layout/Media.svelte';
  import Scroller from './layout/Scroller.svelte';
  import Filler from './layout/Filler.svelte';
  import Divider from './layout/Divider.svelte';
  import Toggle from './ui/Toggle.svelte';
  import Arrow from './ui/Arrow.svelte';

  // # ============================================================================ #
  // 2. Project sepecific imports
  import { getData, setColors, getBreaks, getColor } from './utils.js';
  import { colors } from './config.js';
  import { ScatterChart } from '@onsvisual/svelte-charts';

  // # ============================================================================ #
  // 3. Core config
  // Set theme globally (options are 'light', 'dark' or 'lightblue')
  let theme = 'light';
  setContext('theme', theme);
  setColors(themes, theme);

  // # ============================================================================ #
  // 4. Scroller Configs
  //  - These dont change much between projects.
  //// Config
  const threshold = 0.65;

  //// State
  let animation = getMotion(); // Set animation preference depending on browser preference
  let id = {}; // Object to hold visible section IDs of Scroller components
  let idPrev = {}; // Object to keep track of previous IDs, to compare for changes
  onMount(() => {
    idPrev = { ...id };
  });

  //// Code to run Scroller actions when new caption IDs come into view
  function runActions(codes = []) {
    codes.forEach((code) => {
      if (id[code] != idPrev[code]) {
        if (actions[code][id[code]]) {
          actions[code][id[code]]();
        }
        idPrev[code] = id[code];
      }
    });
  }
  $: id && runActions(Object.keys(actions)); // Run above code when 'id' object changes

  // # ============================================================================ #
  // 5. Project Configs
  // THese will change across projects

  // # ============================================================================ #
  //   5.1 Scrolly actions
  let actions = {
    chart: {
      chart01: () => {
        xKey = 'area';
        yKey = null;
        zKey = null;
        rKey = null;
        explore = false;
      },
      chart02: () => {
        xKey = 'area';
        yKey = null;
        zKey = null;
        rKey = 'pop';
        explore = false;
      },
      chart03: () => {
        xKey = 'area';
        yKey = 'density';
        zKey = null;
        rKey = 'pop';
        explore = false;
      },
      chart04: () => {
        xKey = 'area';
        yKey = 'density';
        zKey = 'parent_name';
        rKey = 'pop';
        explore = false;
      },
    },
  };
  // # ============================================================================ #
  //   5.2 Constants
  const dataset_named = [
    { original: 'region', file: 'state' },
    { original: 'district', file: 'county' },
  ];

  // # ============================================================================ #
  //   5.3 Data
  let data = { district: {}, region: {} };
  let metadata = { district: {}, region: {} };
  let geojson;
  // # ============================================================================ #

  // # ============================================================================ #
  //   5.4 State
  let hovered; // Hovered district (chart or map)
  let selected; // Selected district (chart or map)
  $: region =
    selected && metadata.district.lookup
      ? metadata.district.lookup[selected].parent
      : null; // Gets region code for 'selected'
  $: chartHighlighted =
    metadata.district.array && region
      ? metadata.district.array
          .filter((d) => d.parent == region)
          .map((d) => d.code)
      : []; // Array of district codes in 'region'
  let xKey = 'area'; // xKey for scatter chart
  let yKey = null; // yKey for scatter chart
  let zKey = null; // zKey (color) for scatter chart
  let rKey = null; // rKey (radius) for scatter chart
  let explore = false; // Allows chart/map interactivity to be toggled on/off

  // # ============================================================================ #
  //   5.5 Initialisation code
  dataset_named.forEach((dataset) => {
    const geo = dataset.original;
    const uhc_geo = dataset.file;

    getData(`./data/data_${uhc_geo}.csv`).then((arr) => {
      let meta = arr.map((d) => ({
        code: d.code,
        name: d.name,
        parent: d.parent ? d.parent : null,
      }));
      let lookup = {};

      meta.forEach((d) => {
        lookup[d.code] = d;
      });

      // bug here
      metadata[geo].array = meta;
      metadata[geo].lookup = lookup;

      let indicators = arr.map((d, i) => ({
        ...meta[i],
        area: d.area,
        pop: d['2020'],
        density: d.density,
        age_med: d.age_med,
      }));

      if (geo == 'district') {
        ['density', 'age_med'].forEach((key) => {
          let values = indicators.map((d) => d[key]).sort((a, b) => a - b);
          let breaks = getBreaks(values);
          indicators.forEach(
            (d, i) =>
              (indicators[i][key + '_color'] = getColor(
                d[key],
                breaks,
                colors.seq
              ))
          );
        });
      }
      data[geo].indicators = indicators;

      let years = [
        2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
      ];

      let timeseries = [];
      arr.forEach((d) => {
        years.forEach((year) => {
          timeseries.push({
            code: d.code,
            name: d.name,
            value: d[year],
            year,
          });
        });
      });
      data[geo].timeseries = timeseries;
    });
  });
</script>

<!-- 
  # ============================================================================ #
  #  ............... markup ...............
-->

<!-- 
  # ============================================================================ #
  #  Header
-->

<UHCHeader filled={true} center={false} />

<Header
  bgcolor="#206095"
  bgfixed={true}
  theme="dark"
  center={false}
  short={true}
>
  <h1>UHC Svelte Scrolly Template</h1>
  <p class="text-big" style="margin-top: 5px">
    Epsom Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sequi
    voluptate sed quisquam inventore quia odio illo maiores cum enim, aspernatur
    laboriosam amet ipsam, eligendi optio dolor doloribus minus! Dicta, laborum?
  </p>
  <p style="margin-top: 20px">DD MMM YYYY</p>
  <p>
    <Toggle
      label="Animation {animation ? 'on' : 'off'}"
      mono={true}
      bind:checked={animation}
    />
  </p>
  <div style="margin-top: 90px;">
    <Arrow color="white" {animation}>Scroll to begin</Arrow>
  </div>
</Header>
<!-- 
  # ============================================================================ #
  #  Intro
-->
<Section>
  <h2>Introduction</h2>
  <p>
    Epsom Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque
    minima, quisquam autem fuga unde id vitae expedita iusto blanditiis.
    Necessitatibus dignissimos labore non atque alias quasi. Quaerat quis cum
    architecto.
  </p>

  <blockquote class="text-indent">"A quotation."&mdash;A. Person</blockquote>
</Section>

<Divider />

<!-- 
  # ============================================================================ #
  #  Scrolly 1
-->

<Scroller {threshold} bind:id={id['chart']} splitscreen={true}>
  <div slot="background">
    <figure>
      <div class="col-wide height-full">
        {#if data.district.indicators && metadata.region.lookup}
          <div class="chart">
            <ScatterChart
              height="calc(100vh - 150px)"
              data={data.district.indicators.map((d) => ({
                ...d,
                parent_name: metadata.region.lookup[d.parent].name,
              }))}
              colors={explore ? ['lightgrey'] : colors.cat}
              {xKey}
              {yKey}
              {zKey}
              {rKey}
              idKey="code"
              labelKey="name"
              r={[3, 10]}
              xScale="log"
              xTicks={[10, 100, 1000, 10000]}
              xFormatTick={(d) => d.toLocaleString()}
              xSuffix=" sq.km"
              yFormatTick={(d) => d.toLocaleString()}
              legend={zKey != null}
              labels
              select={explore}
              selected={explore ? selected : null}
              hover
              {hovered}
              highlighted={explore ? chartHighlighted : []}
              colorSelect="#206095"
              colorHighlight="#999"
              overlayFill
              {animation}
            />
          </div>
        {/if}
      </div>
    </figure>
  </div>

  <div slot="foreground">
    <section data-id="chart01">
      <div class="col-medium">
        <p>
          This chart shows the <strong>area in square miles</strong> of each county
          in the North East census region. Each circle represents one county. The
          scale is logarithmic.
        </p>
      </div>
    </section>
    <section data-id="chart02">
      <div class="col-medium">
        <p>
          The radius of each circle shows the <strong>total population</strong> of
          the county.
        </p>
      </div>
    </section>
    <section data-id="chart03">
      <div class="col-medium">
        <p>
          The vertical axis shows the <strong>density</strong> of the county in people
          per square miles.
        </p>
      </div>
    </section>
    <section data-id="chart04">
      <div class="col-medium">
        <p>
          The colour of each circle shows the <strong>state</strong> that the county
          is within.
        </p>
      </div>
    </section>
  </div>
</Scroller>

<Divider />

<!-- 
  # ============================================================================ #
  #  Conclusion
-->

<Section>
  <h2>Conclusions</h2>
  <p>
    Epsom Lorem ipsum dolor sit amet consectetur adipisicing elit. A magni
    ducimus amet repellendus cupiditate? Ad optio saepe ducimus. At eveniet ad
    delectus enim voluptatibus. Quaerat eligendi eaque corrupti possimus
    molestiae?
  </p>
</Section>

<!-- 
  # ============================================================================ #
  #  Footer
-->

<UHCFooter />

<!-- 
  # ============================================================================ #
  #  ............... style ...............
-->
<style>
  /* Styles specific to elements within the demo */
  :global(svelte-scroller-foreground) {
    pointer-events: none !important;
  }
  :global(svelte-scroller-foreground section div) {
    pointer-events: all !important;
  }
  select {
    max-width: 350px;
  }
  .chart {
    margin-top: 45px;
    width: calc(100% - 5px);
  }
  .chart-full {
    margin: 0 20px;
  }
  .chart-sml {
    font-size: 0.85em;
  }
  /* The properties below make the media DIVs grey, for visual purposes in demo */
  .media {
    background-color: #f0f0f0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-flow: column;
    flex-flow: column;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    text-align: center;
    color: #aaa;
  }
</style>
