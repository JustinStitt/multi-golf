<script>
  import P5 from "p5-svelte";
  import * as matter from "matter-js";
  import * as howler from "howler";

  var Engine = matter.Engine;
  var Bodies = matter.Bodies;
  var World = matter.World;
  var Body = matter.Body;

  var engine;
  var world;
  export let width = 300,
    height = 300;

  export let id = 1;

  export let ball_start_pos = { x: 30, y: 30 };
  export let flag_pos = { x: 100, y: 100 };

  var hit_sound = new Howl({ src: ["hit_01.wav"] });
  var flag_sound = new Howl({ src: ["in_flag.wav"] });

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
    d: 25,
    min_d: 0,
    velo_adjusted_diameter: 0,
    adjusted_ball_d: 0,
    collision_scaling: 0.4,

    ball_in_flag: function () {
      let dist = distance(this.x, this.y, ball.x, ball.y);
      let total_velo =
        Math.abs(ball_body.velocity.x) + Math.abs(ball_body.velocity.y);
      this.velo_adjusted_diameter =
        this.d - total_velo * this.collision_scaling;
      this.velo_adjusted_diameter = Math.max(
        this.min_d,
        this.velo_adjusted_diameter
      );
      this.adjusted_ball_d = ball.d - total_velo * this.collision_scaling;
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
      matter.Events.on(engine, "collisionEnd", handleHit);
    }

    p5.draw = () => {
      //p5.background(240, 248, 255);
      p5.background(bg);
      flag.draw(p5);
      ball.draw(p5);
      // drawWalls(p5);
      if (mouse_pressed) {
        // drawArrow2(p5);
        let v0 = p5.createVector(ball.x, ball.y);
        let ep_x = (mouse_drag.start.x - p5.mouseX) / 3;
        let ep_y = (mouse_drag.start.y - p5.mouseY) / 3;
        let v1 = p5.createVector(ep_x, ep_y);
        drawArrow(p5, v0, v1);
      }
    };

    p5.mousePressed = () => {
      let mpos = { x: p5.mouseX, y: p5.mouseY };
      mouse_pressed = true;
      // handle mouse
      mouse_drag.start = mpos;
    };

    p5.mouseReleased = () => {
      let mpos = { x: p5.mouseX, y: p5.mouseY };
      mouse_pressed = false;
      mouse_drag.end = mpos;
      handleMouseDrag();
    };
  };

  let win = false;
  const handleWin = () => {
    if (win) return;
    win = true;
    flag_sound.play();
  };

  function drawArrow(p5, base, vec) {
    let m = vec.mag();
    let myColor = [132 + m, 245 - m / 2, 66];
    p5.push();
    p5.stroke(myColor);
    p5.strokeWeight(5 + m / 75);
    p5.fill(myColor);
    p5.translate(base.x, base.y);
    p5.line(0, 0, vec.x, vec.y);
    p5.rotate(vec.heading());
    let arrowSize = 7;
    p5.translate(vec.mag() - arrowSize, 0);
    p5.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    p5.pop();
  }

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
    let threshhold = 2.5;
    let fx = dx / dampening;
    let fy = dy / dampening;
    let total_force = Math.abs(fx) + Math.abs(fy);
    let sign_x = fx > 0 ? 1 : -1,
      sign_y = fy > 0 ? 1 : -1;
    if (Math.abs(fx) > threshhold) fx = sign_x * threshhold;
    if (Math.abs(fy) > threshhold) fy = sign_y * threshhold;
    Body.setVelocity(ball_body, { x: 0, y: 0 });
    Body.applyForce(
      ball_body,
      { x: ball.x, y: ball.y },
      { x: fx / dampening, y: fy / dampening }
    );
    if (id == 0) {
      hit_sound.play();
    }
  };

  const distance = (x1, y1, x2, y2) => {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
  };

  const handleHit = (event) => {
    if (win) return;
    hit_sound.play();
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
