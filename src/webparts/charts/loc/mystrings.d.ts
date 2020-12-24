declare interface IChartsWebPartStrings {
  PropertyPaneDescription: string;
  SelectListGroupName: string;
  SubWebLabel: string;
  SelectListLabel: string;
  SelectDimensionsGroupName: string;
  SelectXFieldLabel: string;
  SelectYFieldLabel: string;
  SelectGroupByFieldLabel: string;
  ConfigFieldLabel: string;
  OptionsGroupName: string;
}

declare module 'ChartsWebPartStrings' {
  const strings: IChartsWebPartStrings;
  export = strings;
}