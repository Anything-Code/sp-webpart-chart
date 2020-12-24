declare module 'mystock' {
  interface IMyStock {
    draw(text: object): void;
    d3(name: object): void;
    c3(name: object): void;
  }
  const mystock: IMyStock;
  export default mystock;
}