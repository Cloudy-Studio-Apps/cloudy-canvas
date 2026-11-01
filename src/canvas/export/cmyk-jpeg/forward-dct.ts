/** The forward DCT of an 8×8 block in place (Arai, Agui and Nakajima's, as libjpeg's float one). */
export function forwardDct(d: Float32Array): void {
  for (let i = 0; i < 8; i++) pass(d, i * 8, 1);
  for (let i = 0; i < 8; i++) pass(d, i, 8);
}

function pass(d: Float32Array, at: number, step: number): void {
  const p = (n: number) => at + n * step;
  const tmp0 = d[p(0)]! + d[p(7)]!;
  const tmp7 = d[p(0)]! - d[p(7)]!;
  const tmp1 = d[p(1)]! + d[p(6)]!;
  const tmp6 = d[p(1)]! - d[p(6)]!;
  const tmp2 = d[p(2)]! + d[p(5)]!;
  const tmp5 = d[p(2)]! - d[p(5)]!;
  const tmp3 = d[p(3)]! + d[p(4)]!;
  const tmp4 = d[p(3)]! - d[p(4)]!;

  const tmp10 = tmp0 + tmp3;
  const tmp13 = tmp0 - tmp3;
  const tmp11 = tmp1 + tmp2;
  const tmp12 = tmp1 - tmp2;
  d[p(0)] = tmp10 + tmp11;
  d[p(4)] = tmp10 - tmp11;
  const z1 = (tmp12 + tmp13) * 0.707106781;
  d[p(2)] = tmp13 + z1;
  d[p(6)] = tmp13 - z1;

  const a = tmp4 + tmp5;
  const b = tmp5 + tmp6;
  const c = tmp6 + tmp7;
  const z5 = (a - c) * 0.382683433;
  const z2 = 0.5411961 * a + z5;
  const z4 = 1.306562965 * c + z5;
  const z3 = b * 0.707106781;
  const z11 = tmp7 + z3;
  const z13 = tmp7 - z3;
  d[p(5)] = z13 + z2;
  d[p(3)] = z13 - z2;
  d[p(1)] = z11 + z4;
  d[p(7)] = z11 - z4;
}
