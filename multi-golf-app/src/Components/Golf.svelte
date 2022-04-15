<script>
  import P5 from "p5-svelte";
  import * as matter from "matter-js";

  var Engine = matter.Engine;
  var Bodies = matter.Bodies;
  var World = matter.World;
  var Body = matter.Body;

  var engine;
  var world;
  export let width = 300,
    height = 300;

  export let ball_start_pos = { x: 30, y: 30 };
  export let flag_pos = { x: 100, y: 100 };

  let canv;
  let ball = {
    x: ball_start_pos.x,
    y: ball_start_pos.y,
    d: 20,
    v: { x: 0, y: 0 },
    color: [240, 248, 255],

    check_border_collision: function () {
      let tlx = this.x - this.d / 2;
      let tly = this.y - this.d / 2;
      if (tlx + this.d >= width || tlx <= 0) {
        Body.setVelocity(ball_body, {
          x: ball_body.velocity.x * -1,
          y: ball_body.velocity.y,
        });
      }
      if (tly + this.d >= height || tly <= 0) {
        Body.setVelocity(ball_body, {
          x: ball_body.velocity.x,
          y: ball_body.velocity.y * -1,
        });
      }
    },

    draw: function (p5) {
      if (win) return;
      this.x = ball_body.position.x;
      this.y = ball_body.position.y;
      this.check_border_collision();
      p5.fill(this.color);
      p5.circle(this.x, this.y, this.d);
    },
  };

  let flag = {
    x: flag_pos.x,
    y: flag_pos.y,
    d: 40,
    color: [20, 20, 20],

    ball_in_flag: function () {
      let dist = distance(this.x, this.y, ball.x, ball.y);
      if (dist <= this.d / 2 + ball.d / 2) {
        return true;
      }
      return false;
    },

    draw: function (p5) {
      if (this.ball_in_flag()) handleWin();
      p5.fill(this.color);
      p5.circle(this.x, this.y, this.d);
    },
  };

  let mouse_drag = {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    mag: 0,
  };

  let mouse_pressed = false;
  let dampening = 120;

  var ball_body;

  export const sketch = (p5) => {
    p5.setup = () => {
      p5.createCanvas(width, height);
      p5.frameRate(60);
      canv = p5;

      /* matter-js */
      engine = Engine.create();
      world = engine.world;
      ball_body = Bodies.circle(ball.x, ball.y, ball.d, {
        resitution: 0.7,
        friction: 0.2,
      });
      World.add(world, ball_body);
      engine.world.gravity.y = 0;
      Engine.run(engine);
    };

    p5.draw = () => {
      p5.background(240, 248, 255);
      ball.draw(p5);
      flag.draw(p5);
      if (mouse_pressed) {
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

  let win = false;
  const handleWin = () => {
    flag.color = [0, 255, 0];
    win = true;
  };

  const handleMouseDrag = () => {
    let start = mouse_drag.start,
      end = mouse_drag.end;
    let dx = start.x - end.x;
    let dy = start.y - end.y;
    if (Math.abs(dx) + Math.abs(dy) < 13) return;
    console.log(dx, dy, dx + dy);
    let fx = dx / dampening;
    let fy = dy / dampening;
    Body.applyForce(
      ball_body,
      { x: ball.x, y: ball.y },
      { x: fx / dampening, y: fy / dampening }
    );
  };

  const distance = (x1, y1, x2, y2) => {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
  };

  const mouseInCanvas = (mpos) => {
    return true;
    if (mpos.x < 0 || mpos.x > width) return false;
    if (mpos.y < 0 || mpos.y > height) return false;
    return true;
  };
</script>

<!-- begin HTML -->
<div class="canvas" class:win>
  <P5 {sketch} />
</div>

<!-- end HTML -->
<style>
  .canvas {
    margin: 8px;
    padding: 8px 8px 4px 8px; /*top right bottom left*/
    border-radius: 4px;
    background-color: rebeccapurple;
  }

  .win {
    animation: pop 0.5s ease-in-out;
    background-color: teal;
    filter: opacity(0.2);
    transition: all 1s linear;
  }

  @keyframes pop {
    0% {
      transform: scale(1) rotateZ(0);
    }
    50% {
      transform: scale(1.1) rotateZ(4deg);
    }
    100% {
      transform: scale(1) rotateZ(0);
    }
  }
</style>
