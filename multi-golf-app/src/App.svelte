<script>
  import Golf from "./Components/Golf";
  let golf;
</script>

<main>
  <h1>Multi Golf ⛳</h1>
  <Golf bind:this={golf} />
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
</style>
