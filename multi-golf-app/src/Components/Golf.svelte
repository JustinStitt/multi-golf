<script>
  import P5 from "p5-svelte";
  import * as matter from "matter-js";
  import * as howler from "howler";
  import { onMount, createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  var Engine = matter.Engine;
  var Bodies = matter.Bodies;
  var World = matter.World;
  var Body = matter.Body;

  var engine;
  var world;
  export let size = 300;
  let width = 300,
    height = 300;

  export let level_data;
  let level_objects = [];
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
    d: 30,
    min_d: 1,
    velo_adjusted_diameter: 0,
    adjusted_ball_d: 0,
    collision_scaling: 1.3,

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
  let brick_image;
  let brick_shadow_image;

  let walls = [];

  function matterjs_setup() {
    /* matter-js */
    engine = Engine.create();
    world = engine.world;
    ball_body = Bodies.circle(ball_start_pos.x, ball_start_pos.y, ball.d / 2, {
      restitution: 1.0,
      friction: 0.2,
      isStatic: false,
    });
    ball.x = ball_body.position.x;
    ball.y = ball_body.position.y;

    World.add(world, [ball_body, ...setupWalls()]);
    setupLevel();
    world.gravity.y = 0;
    matter.Resolver._restingThresh = 0.00001;
    Engine.run(engine);
    matter.Events.on(engine, "collisionEnd", handleHit);
  }

  const setup = (p5) => {
    p5.createCanvas(width, height);
    p5.frameRate(60);
    bg = p5.loadImage("canv-bg-1.png");
    ball_image = p5.loadImage("canv-ball.png");
    flag_image = p5.loadImage("canv-flag.png");
    flag.x = flag_pos.x;
    flag.y = flag_pos.y;
    canv = p5;
    matterjs_setup();
  };

  export const sketch = (p5) => {
    p5.preload = () => {
      brick_image = p5.loadImage("canv-brick.png");
      brick_shadow_image = p5.loadImage("canv-brick-shadow.png");
    };

    p5.setup = () => {
      setup(p5);
    };

    p5.draw = () => {
      p5.push();
      p5.resizeCanvas(size, size);
      p5.scale(size / width, size / height);
      p5.background(bg);
      flag.draw(p5);
      ball.draw(p5);
      // drawWalls(p5);
      drawLevelObjects(p5);
      if (mouse_pressed) {
        let v0 = p5.createVector(ball.x, ball.y);
        let ep_x = (mouse_drag.start.x - p5.mouseX) / 3;
        let ep_y = (mouse_drag.start.y - p5.mouseY) / 3;
        let v1 = p5.createVector(ep_x, ep_y);
        drawArrow(p5, v0, v1);
      }
      p5.pop();
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

    p5.keyPressed = () => {
      if (p5.keyCode == 82) reset();
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

  const setupWalls = () => {
    let wall_params = {
      restitution: 1.0,
      isStatic: true,
    };
    let wall_thickness = 1;
    let top_wall = Bodies.rectangle(
      width / 2,
      -height / 2,
      width,
      wall_thickness + height,
      wall_params
    );
    let bot_wall = Bodies.rectangle(
      width / 2,
      height + height / 2,
      width,
      wall_thickness + height,
      wall_params
    );
    let right_wall = Bodies.rectangle(
      width + width / 2,
      height / 2,
      wall_thickness + width,
      height,
      wall_params
    );
    let left_wall = Bodies.rectangle(
      -width / 2,
      height / 2,
      wall_thickness + width,
      height,
      wall_params
    );

    walls = [top_wall, bot_wall, right_wall, left_wall];
    return walls;
  };

  const setupLevel = () => {
    // ball_body.position = ball_start_pos;
    if (!level_data) return;
    resizeLevelObjectImages();
    World.add(world, [...level_data]);
  };

  const resizeLevelObjectImages = () => {
    if (!level_data) return;
    level_objects = [];
    let bw = brick_image.width,
      bh = brick_image.height;
    level_data.forEach((elem) => {
      if (!elem.bounds) return;
      let img = canv.createImage(bw, bh);
      let shadow = canv.createImage(bw, bh);
      img.copy(brick_image, 0, 0, bw, bh, 0, 0, bw, bh);
      shadow.copy(brick_shadow_image, 0, 0, bw, bh, 0, 0, bw, bh);
      let { min, max } = elem.bounds;
      let w = max.x - min.x;
      let h = max.y - min.y;
      img.resize(w, h);
      shadow.resize(w, h);
      let to_add = { img: img, shadow: shadow, obj: elem };
      level_objects.push(to_add);
    });
  };

  const drawLevelObjects = (p5) => {
    if (!level_data) return;
    let objs = level_objects;
    // objs.forEach((elem) => {
    //   var vertices = elem.vertices;
    //   p5.fill(255, 0, 0);
    //   p5.beginShape();
    //   for (var i = 0; i < vertices.length; i++) {
    //     p5.vertex(vertices[i].x, vertices[i].y);
    //   }
    //   p5.endShape();
    // });
    objs.forEach((elem) => {
      let { min, max } = elem.obj.bounds;
      let w = max.x - min.x;
      let h = max.y - min.y;
      let x = elem.obj.position.x - w / 2;
      let y = elem.obj.position.y - h / 2;
      p5.image(elem.shadow, x, y + 6);
      p5.strokeWeight(4);
      p5.rect(x, y, w, h, 6);
      p5.image(elem.img, x, y);
    });
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
    let dist = Math.abs(dx) + Math.abs(dy);
    let max_dist = 1000;
    if (dist > max_dist) {
      let og_x_ratio = Math.abs(dx) / dist;
      let og_y_ratio = Math.abs(dy) / dist;
      dx = og_x_ratio * max_dist * (dx > 0 ? 1 : -1);
      dy = og_y_ratio * max_dist * (dy > 0 ? 1 : -1);
    }
    console.log("dist: ", dist);
    let minimum_drag_distance = 40;
    if (Math.abs(dx) + Math.abs(dy) < minimum_drag_distance) return;
    stroke(); // send stroke to App.svelte via dispatch (if we are id 0)
    let threshhold = 2.5;
    let fx = dx / dampening;
    let fy = dy / dampening;
    let total_force = Math.abs(fx) + Math.abs(fy);
    let sign_x = fx > 0 ? 1 : -1,
      sign_y = fy > 0 ? 1 : -1;

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

  let mounted = false;
  const reset = () => {
    if (!mounted) return;
    win = false;
    World.clear(world);
    Engine.clear(engine);
    setup(canv);
    stroke(-1); // reset stroke
  };

  $: reset(level_data);

  onMount(() => {
    mounted = true;
  });

  const stroke = (incr = 1) => {
    if (id) return;
    dispatch("stroke", {
      inc: incr,
    });
  };
</script>

<!-- begin HTML -->
<div class="canvas" class:win>
  <div class="rounded">
    <P5 {sketch} />
  </div>
</div>

<!-- end HTML -->
<style>
  .canvas {
    margin: 3px;
    padding: 8px 8px 4px 8px; /*top right bottom left*/
    border-radius: 15px;
    background-color: teal;
  }

  .rounded {
    border-radius: 15px;
    overflow: hidden;
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
