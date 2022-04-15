<script>
  import P5 from "p5-svelte";
  let width = 400,
    height = 400;

  let canv;

  let ball = {
    x: 30,
    y: 30,
    d: 20,
    v: { x: 0, y: 0 },

    check_border_collision: function () {
      let tlx = this.x - this.d / 2;
      let tly = this.y - this.d / 2;
      if (tlx + this.d >= width || tlx <= 0) this.v.x *= -1;
      if (tly + this.d >= height || tly <= 0) this.v.y *= -1;
    },

    draw: function (p5) {
      this.x += this.v.x * p5.deltaTime;
      this.y += this.v.y * p5.deltaTime;
      this.check_border_collision();
      p5.circle(this.x, this.y, this.d);
    },
  };

  let mouse_drag = {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    mag: 0,
  };

  let mouse_pressed = false;
  let minimum_magnitude = 15.0;
  let maximum_magnitude = 100.0;
  let magnitude_dampening = 2.3;

  export const sketch = (p5) => {
    p5.setup = () => {
      p5.createCanvas(width, height);
      p5.frameRate(60);
      canv = p5;
    };

    p5.draw = () => {
      p5.background(240, 248, 255);
      ball.draw(p5);
      if (mouse_pressed) {
        //p5.line(mouse_drag.start.x, mouse_drag.start.y, p5.mouseX, p5.mouseY);
        p5.line(
          ball.x,
          ball.y,
          ball.x + (mouse_drag.start.x - p5.mouseX),
          ball.y + (mouse_drag.start.y - p5.mouseY)
        );
      }
    };

    p5.mousePressed = () => {
      let mpos = { x: p5.mouseX, y: p5.mouseY };
      if (!mouseInCanvas(mpos)) return;
      mouse_pressed = true;
      // handle mouse
      mouse_drag.start = mpos;
    };

    p5.mouseReleased = () => {
      let mpos = { x: p5.mouseX, y: p5.mouseY };
      if (!mouseInCanvas(mpos)) return;
      mouse_pressed = false;
      mouse_drag.end = mpos;
      handleMouseDrag();
    };
  };

  const handleMouseDrag = () => {
    let start = mouse_drag.start,
      end = mouse_drag.end;
    let magnitude = ((start.x - end.x) ** 2 + (start.y - end.y) ** 2) ** 0.5;
    if (magnitude < minimum_magnitude) return;
    magnitude = Math.max(magnitude, maximum_magnitude);
    magnitude *= magnitude_dampening;
    ball.v.x = (start.x - end.x) / magnitude;
    ball.v.y = (start.y - end.y) / magnitude;
  };

  const mouseInCanvas = (mpos) => {
    if (mpos.x < 0 || mpos.x > width) return false;
    if (mpos.y < 0 || mpos.y > height) return false;
    return true;
  };
</script>

<!-- begin HTML -->
<div class="canvas">
  <P5 {sketch} />
</div>

<!-- end HTML -->
<style>
  .canvas {
    margin: 8px;
    padding: 8px 8px 4px 8px; /*top right bottom left*/
    background-color: rebeccapurple;
  }
</style>
