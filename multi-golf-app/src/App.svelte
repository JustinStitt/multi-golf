<script>
  import Golf from "./Components/Golf";
  import Playground from "./Components/Playground";
  import loadLevels from "./levels";

  let level_data = loadLevels();

  let num = 2;
  let current_level = 0;
  $: arr = [...Array(num * num).keys()];

  $: triggerChange(current_level);

  const triggerChange = (cl) => {
    current_level = Math.max(current_level, 0);
    current_level = Math.min(level_data.length - 1, current_level);
    arr = [...Array(num * num).keys()];
    console.log(cl);
  };
</script>

<main>
  <h1>Multi Golf ⛳</h1>
  <!-- <div class="games">
    <Golf id={0} ball_start_pos={{ x: 250, y: 250 }} />
    <Golf flag_pos={{ x: 145, y: 241 }} />
    <Golf flag_pos={{ x: 55, y: 114 }} />
    <Golf flag_pos={{ x: 200, y: 30 }} />
  </div> -->
  <div class="games" style={`grid-template-columns: ${"1fr ".repeat(num)};`}>
    {#each arr as elem (elem)}
      <Golf
        id={elem}
        level_data={level_data[current_level][elem].objs}
        ball_start_pos={level_data[current_level][elem].bpos}
        flag_pos={level_data[current_level][elem].fpos}
        size={600 / num}
      />
    {/each}
  </div>
  <input type="number" bind:value={current_level} style="margin-top: 10px;" />
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
