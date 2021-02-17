import logo from "./logo.svg";
import "./App.css";
import tinycolor from "tinycolor2";
import { base, charts, showcase, saturated } from "./input.js";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

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

function findSimilar(color) {
  return showcase.filter((e) => {
    const sc = tinycolor(e.color);
    return distance(color, sc) < 1;
  });
}

function newScale(color, name) {
  const sourceColor = tinycolor(color);
  const sourceColorHSL = sourceColor.toHsl();

  const sourceLightness = sourceColorHSL.l; // 8 * Math.round((sourceColorHSL.l * 100) / 8);

  const blocks = [];

  for (let step = 15; step < 100; step += 10) {
    const lightness =
      Math.round(sourceLightness + (step - sourceLightness)) / 100;

    const blockColor = tinycolor.fromRatio({
      h: sourceColorHSL.h,
      s: sourceColorHSL.s,
      l: lightness,
    });

    blocks.push({
      name: `${name}-${Math.round(lightness * 100)}`,
      color: blockColor,
      isSource: distance(blockColor, sourceColor) < 0.05,
      sourceColor: sourceColor,
      matches: findSimilar(blockColor),
    });
  }

  return {
    uid: uuidv4(),
    blocks: blocks,
    source: sourceColor,
  };
}

function newDesignSystem(baseColors) {
  let scales = baseColors.map((color) => newScale(color, "cname"));

  // const scalesToRemove = [];
  // for (const scale of scales) {
  //   if (scalesToRemove.includes(scale.uid)) {
  //     continue;
  //   }

  //   let similarScales = scales.filter((s) => {
  //     return distance(s.blocks[0].color, scale.blocks[0].color) < 10;
  //   });

  //   similarScales.sort(
  //     (s1, s2) =>
  //       s1.blocks.reduce(
  //         (matched, block) => matched + block.matches.length,
  //         0
  //       ) -
  //       s2.blocks.reduce((matched, block) => matched + block.matches.length, 0)
  //   );

  //   similarScales = similarScales.reverse();
  //   similarScales.pop();
  //   scalesToRemove.push(...similarScales.map((s) => s.uid));
  // }

  // scales = scales.filter((s) => !scalesToRemove.includes(s.uid));

  const matched = scales
    .map((scale) => scale.blocks)
    .flatMap((blocks) => blocks.flatMap((block) => block.matches))
    .filter(onlyUnique);

  const notMatched = showcase.filter((e) => !matched.includes(e));

  return {
    scales: scales,
    notMatched: {
      count: notMatched.length,
      elements: notMatched,
    },
    matched: {
      count: matched.length,
      elements: matched,
    },
  };
}

function ColorScale({ scale, onBlockSelected }) {
  // const scale = newScale(color, name);

  const renderBlock = (block) => {
    const color = block.color;

    return (
      <div
        onClick={() => onBlockSelected(block)}
        key={color.toHex()}
        style={{
          color: color.isLight() ? "#212121" : "#ededed",
          backgroundColor: `${color.toHexString()}`,
          width: "170px",
          padding: "8px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>{block.name}</div>
        <div>{color.toHexString()}</div>
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          color: scale.source.isLight() ? "#212121" : "#ededed",
          backgroundColor: scale.source.toHexString(),
          width: "170px",
          padding: "8px",
          marginBottom: "5px",
        }}
      >
        {scale.source.toHexString()}
      </div>
      <div style={{ margin: "2px" }}>{scale.blocks.map(renderBlock)}</div>{" "}
    </div>
  );
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const extra = [
  "#FF050F",
  "#FFFCCC",
  "#E1F0DB",
  "#4E6B61",
  "#F5F7FB",
  "#DBE4F0",
  "#3EBEDE",
];

function App() {
  let colors = showcase.map((e) => e.color).filter(onlyUnique);

  colors = colors.sort((a, b) => {
    let ca = tinycolor(a);
    let cb = tinycolor(b);
    return ca.toHsl().h - cb.toHsl().h;
  });

  const ds = newDesignSystem(colors);
  console.log(ds);

  console.log(distance(tinycolor("#ffecb3"), tinycolor("#ffe0b2")));

  const [selectedBlock, handleSelectBlock] = useState();

  const renderSelectedBlock = () => {
    if (!selectedBlock) {
      return null;
    }

    return (
      <div>
        {selectedBlock.matches.map((m) => (
          <div>{m.name}</div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div style={{ minHeight: "200px" }}>{renderSelectedBlock()}</div>
      <div style={{ flexDirection: "row", display: "flex" }}>
        {ds.scales.map((scale) => (
          <ColorScale scale={scale} onBlockSelected={handleSelectBlock} />
        ))}
      </div>
    </>
  );
}

export default App;
