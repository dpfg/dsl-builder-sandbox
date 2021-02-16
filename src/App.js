import logo from "./logo.svg";
import "./App.css";
import tinycolor from "tinycolor2";
import { base, charts, showcase, saturated } from "./input.js";

function distance(c1, c2) {
  const c1hsl = c1.toHsl();
  const c2hsl = c2.toHsl();

  const v1 = [c1hsl.h, c1hsl.s, c1hsl.l, c1hsl.a];
  const v2 = [c2hsl.h, c2hsl.s, c2hsl.l, c2hsl.a];

  let i,
    d = 0;

  for (i = 0; i < v1.length; i++) {
    d += (v1[i] - v2[i]) * (v1[i] - v2[i]);
  }
  return Math.sqrt(d);
}

function findMatches(color) {
  return showcase.filter((e) => {
    const sc = tinycolor(e.color);
    return distance(color, sc) < 1;
  });
}

function newScale(color, name) {
  const sourceColor = tinycolor(color);
  const sourceColorHSL = sourceColor.toHsl();

  const sourceLightness = sourceColorHSL.l; // 8 * Math.round((sourceColorHSL.l * 100) / 8);

  const scale = [];

  for (let step = 10; step < 100; step += 10) {
    const lightness =
      Math.round(sourceLightness + (step - sourceLightness)) / 100;

    const blockColor = tinycolor.fromRatio({
      h: sourceColorHSL.h,
      s: sourceColorHSL.s,
      l: lightness,
    });

    scale.push({
      name: `${name}-${Math.round(lightness * 100)}`,
      color: blockColor,
      isSource: distance(blockColor, sourceColor) < 0.05,
      sourceColor: sourceColor,
      matches: findMatches(blockColor),
    });
  }

  return scale;
}

class DesignSystemBuilder {
  constructor(baseColors) {
    this.baseColors = baseColors;
    this.scales = baseColors.map((color) => newScale(color, "ex"));
  }
}

function ColorScale({ color, name }) {
  const scale = newScale(color, name);

  const renderBlock = (block) => {
    const color = block.color;

    return (
      <div
        key={color.toHex()}
        style={{
          color: color.isLight() ? "#212121" : "#ededed",
          backgroundColor: `${color.toHexString()}`,
          width: "150px",
          padding: "8px",
        }}
      >
        {color.toHexString()} <br />
        {block.name}
        <br />
        {block.matches.map((c) => (
          <div>{c.name}</div>
        ))}
        <br />
        {block.isSource ? "origin:" + block.sourceColor.toHexString() : ""}
      </div>
    );
  };

  return <div style={{ margin: "2px" }}>{scale.map(renderBlock)}</div>;
}

function App() {
  let colors = [...base, ...charts, ...saturated];

  colors = colors.sort((a, b) => {
    let ca = tinycolor(a);
    let cb = tinycolor(b);
    return ca.toHsl().h - cb.toHsl().h;
  });

  return (
    <div style={{ flexDirection: "row", display: "flex" }}>
      {colors.map((c) => (
        <ColorScale color={c} name="blue" />
      ))}
    </div>
  );
}

export default App;
