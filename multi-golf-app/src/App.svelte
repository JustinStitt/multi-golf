<script>
  import { slide } from "svelte/transition";
  import Golf from "./Components/Golf";
  import Playground from "./Components/Playground";
  import loadLevels from "./levels";

  let all_level_data = loadLevels();
  let strokes = 0;
  let num = 2;
  let current_level = 0;
  $: arr = [...Array(num * num).keys()];

  $: triggerChange(current_level);

  const triggerChange = (cl) => {
    current_level = Math.max(current_level, 0);
    current_level = Math.min(all_level_data.length - 1, current_level);
    arr = [...Array(num * num).keys()];
    strokes = 0;
  };

  const swap_level = () => {
    current_level = (current_level + 1) % all_level_data.length;
  };

  const handleStroke = (e) => {
    let inc = e.detail.inc;
    if (inc == -1) strokes = 0;
    else strokes += inc;
  };

  $: level_data = all_level_data[current_level].objs;
  $: meta_data = all_level_data[current_level].meta;
</script>

<main>
  <h1>Multi Golf ⛳</h1>
  <div class="games" style={`grid-template-columns: ${"1fr ".repeat(num)};`}>
    {#each arr as elem (elem)}
      <span transition:slide>
        <Golf
          id={elem}
          level_data={!level_data[elem] ? [1, 2] : level_data[elem].objs}
          ball_start_pos={!level_data[elem]
            ? { x: 170, y: 130 }
            : level_data[elem].bpos}
          flag_pos={!level_data[elem]
            ? { x: 100, y: 100 }
            : level_data[elem].fpos}
          size={600 / num}
          on:stroke={handleStroke}
        />
      </span>
    {/each}
  </div>
  <div
    style="width: 30%; display: flex; justify-content: space-between; margin-top: 10px;"
  >
    <button on:click={swap_level}> Next Level </button>
    <h3>
      Current Level: {current_level + 1} | Par: {meta_data.par} Stroke: {strokes}
    </h3>
    <!-- <input type="number" bind:value={current_level} style="margin-top: 10px;" />
  <input type="number" bind:value={num} style="margin-top: 10px;" /> -->
  </div>

  <!-- <Playground /> -->
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  h1 {
    text-align: center;
    font-size: 3em;
    font-weight: bold;
    margin: 0;
    width: 100%;
    background-color: teal;
  }

  .games {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
</style>
