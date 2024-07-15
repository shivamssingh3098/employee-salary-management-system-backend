exports.generate = (n) => {
  let add = 1,
    max = 12 - add;

  if (n > max) {
    return generate(max) + generate(n - max);
  }

  max = Math.pow(10, n + add);
  let min = max / 10;
  let number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
};
