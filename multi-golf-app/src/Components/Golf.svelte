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

    draw: function (p5) {
      if (win) {
        if (ball_image.width < 2) return;
        ball_body.position.x = flag_pos.x + Math.sin(p5.frameCount / 2) * 2;
        ball_body.position.y = flag_pos.y + Math.cos(p5.frameCount / 2) * 2;
        ball_image.resize((ball_image.width -= 1), (ball_image.height -= 1));
      }
      this.x = ball_body.position.x;
      this.y = ball_body.position.y;
      p5.image(
        ball_image,
        this.x - ball_image.width / 4,
        this.y - ball_image.height / 4,
        ball_image.width / 2,
        ball_image.height / 2
      );
    },
  };

  let flag = {
    x: flag_pos.x,
    y: flag_pos.y,
    d: 16,
    min_d: 0,
    velo_adjusted_diameter: 0,
    adjusted_ball_d: 0,

    ball_in_flag: function () {
      let dist = distance(this.x, this.y, ball.x, ball.y);
      let total_velo =
        Math.abs(ball_body.velocity.x) + Math.abs(ball_body.velocity.y);
      this.velo_adjusted_diameter = this.d - total_velo * 3;
      this.velo_adjusted_diameter = Math.max(
        this.min_d,
        this.velo_adjusted_diameter
      );
      this.adjusted_ball_d = ball.d - total_velo * 3;
      this.adjusted_ball_d = Math.max(this.adjusted_ball_d, 0);
      if (dist < this.velo_adjusted_diameter / 2 + this.adjusted_ball_d / 2) {
        return true;
      }
      return false;
    },

    draw: function (p5) {
      if (this.ball_in_flag()) handleWin();
      let img_scale = 1.5;
      p5.image(
        flag_image,
        this.x - flag_image.width / (img_scale * 2),
        this.y - flag_image.height / (img_scale * 2),
        flag_image.width / img_scale,
        flag_image.height / img_scale
      );
    },
  };

  let mouse_drag = {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    mag: 0,
  };

  let mouse_pressed = false;
  let dampening = 240;

  var ball_body;

  let bg;
  let ball_image;
  let flag_image;

  let walls = [];

  export const sketch = (p5) => {
    p5.setup = () => {
      p5.createCanvas(width, height);
      p5.frameRate(60);
      bg = p5.loadImage("canv-bg-1.png");
      ball_image = p5.loadImage("canv-ball.png");
      flag_image = p5.loadImage("canv-flag.png");
      canv = p5;
      matterjs_setup();
    };

    function matterjs_setup() {
      /* matter-js */
      engine = Engine.create();
      world = engine.world;
      ball_body = Bodies.circle(ball.x, ball.y, ball.d / 2, {
        restitution: 1.0,
        friction: 0.2,
        isStatic: false,
      });
      let wall_params = {
        restitution: 1.0,
        isStatic: true,
      };
      let wall_thickness = 1;
      let top_wall = Bodies.rectangle(
        width / 2,
        0,
        width,
        wall_thickness,
        wall_params
      );
      let bot_wall = Bodies.rectangle(
        width / 2,
        height,
        width,
        wall_thickness,
        wall_params
      );
      let right_wall = Bodies.rectangle(
        width,
        height / 2,
        wall_thickness,
        height,
        wall_params
      );
      let left_wall = Bodies.rectangle(
        0,
        height / 2,
        wall_thickness,
        height,
        wall_params
      );

      walls = [top_wall, bot_wall, right_wall, left_wall];
      World.add(world, [ball_body, ...walls]);
      world.gravity.y = 0;
      matter.Resolver._restingThresh = 0.00001;
      Engine.run(engine);
    }

    p5.draw = () => {
      //p5.background(240, 248, 255);
      p5.background(bg);
      flag.draw(p5);
      ball.draw(p5);
      // drawWalls(p5);
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
    win = true;
  };

  const drawWalls = (p5) => {
    walls.forEach((elem) => {
      var vertices = elem.vertices;
      p5.fill(255);
      p5.beginShape();
      for (var i = 0; i < vertices.length; i++) {
        p5.vertex(vertices[i].x, vertices[i].y);
      }
      p5.endShape();
    });
  };

  const handleMouseDrag = () => {
    let start = mouse_drag.start,
      end = mouse_drag.end;
    let dx = start.x - end.x;
    let dy = start.y - end.y;
    if (Math.abs(dx) + Math.abs(dy) < 13) return;
    let fx = dx / dampening;
    let fy = dy / dampening;
    Body.setVelocity(ball_body, { x: 0, y: 0 });
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
