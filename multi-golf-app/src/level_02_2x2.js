import P5 from "p5-svelte";
import * as matter from "matter-js";

var Bodies = matter.Bodies;

let wall_params = {
  restitution: 1.0,
  isStatic: true,
};

const tile0 = () => {
  let bpos = { x: 50, y: 30 };
  let fpos = { x: 25, y: 200 };
  let obj1 = Bodies.rectangle(10, 100, 200, 85, wall_params);
  return { bpos: bpos, fpos: fpos, objs: [obj1] };
};

const tile1 = () => {
  let bpos = { x: 120, y: 170 };
  let fpos = { x: 275, y: 30 };
  let obj1 = Bodies.rectangle(100, 100, 110, 25, wall_params);
  let obj2 = Bodies.rectangle(250, 200, 20, 85, wall_params);

  return { bpos: bpos, fpos: fpos, objs: [obj1, obj2] };
};

const tile2 = () => {
  let bpos = { x: 20, y: 210 };
  let fpos = { x: 205, y: 40 };
  let obj1 = Bodies.rectangle(200, 175, 55, 55, wall_params);
  return { bpos: bpos, fpos: fpos, objs: [obj1] };
};

const tile3 = () => {
  let bpos = { x: 250, y: 110 };
  let fpos = { x: 100, y: 150 };
  let obj1 = Bodies.rectangle(20, 100, 20, 85, wall_params);
  return { bpos: bpos, fpos: fpos, objs: [obj1] };
};

export function setupLevel() {
  let objs = [tile0(), tile1(), tile2(), tile3()];
  return {objs: objs, meta: {par: 2}};
}
