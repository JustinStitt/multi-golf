<script>
  import P5 from "p5-svelte";
  let width = 300,
    height = 300;

  let p1x = 100,
    p1y = 100;

  let p2x = 135,
    p2y = 140;

  let a = 0.01;

  let lax = 135 - 30;
  let lay = 140 - 15;

  let rax = 135 + 30;
  let ray = 140 - 15;

  const sketch = (p5) => {
    p5.setup = () => {
      p5.createCanvas(width, height);
      p5.frameRate(60);
    };

    p5.draw = () => {
      p5.background(42, 42, 42);
      p5.fill(255, 0, 0);
      p5.rect(p1x, p1y, 10, 10);
      p5.fill(0, 255, 0);
      p5.rect(p2x, p2y, 10, 10);
      p2x = p5.mouseX;
      p2y = p5.mouseY;
      p5.strokeWeight(1);
      p5.line(p1x, p1x, p2x, p2y);
      p5.line(lax, lay, p2x, p2y);
      p5.line(rax, ray, p2x, p2y);
      //   let new_pos = rotatePointAroundPoint(p2x, p2y, p1x, p1y);
      //   p2x = new_pos.x;
      //   p2y = new_pos.y;

      let new_pos = rotatePointAroundPoint(lax, lay, p1x, p1y);
      lax = new_pos.x;
      lay = new_pos.y;

      new_pos = rotatePointAroundPoint(rax, ray, p1x, p1y);
      rax = new_pos.x;
      ray = new_pos.y;
    };
  };

  const rotatePointAroundPoint = (x1, y1, x2, y2) => {
    let a = Math.atan(x2 - x1, y2 - y1);
    // let new_x = Math.cos(a) * (x1 - x2) - Math.sin(a) * (y1 - y2) + y2;
    // let new_y = Math.sin(a) * (x1 - x2) + Math.cos(a) * (y1 - y2) + y2;
    let new_x = Math.cos(a);
    let new_y = Math.sin(a);
    return { x: new_x, y: new_y };
  };
</script>

<!-- being HTML -->
<P5 {sketch} />

<!-- end HTML -->
<style>
</style>
