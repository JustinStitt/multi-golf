<script>
  import Golf from "./Components/Golf";
  import Playground from "./Components/Playground";
</script>

<main>
  <h1>Multi Golf ⛳</h1>
  <div class="games">
    <Golf id={0} ball_start_pos={{ x: 250, y: 250 }} />
    <Golf flag_pos={{ x: 145, y: 241 }} />
    <Golf flag_pos={{ x: 55, y: 114 }} />
    <Golf flag_pos={{ x: 200, y: 30 }} />
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
