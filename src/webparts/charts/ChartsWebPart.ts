import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { uniqueId } from 'lodash';

import * as strings from 'ChartsWebPartStrings';

import mystock from 'mystock';
import * as d3 from 'd3';
import * as c3 from "c3";

import 'c3/c3.min.css';

import { Web } from '@pnp/sp/presets/all';

// const web = Web('https://snpcom.sharepoint.com/');
const web = Web('https://snpcom.sharepoint.com/GlobalFunctions/hr/');

export type IChartsWebPartProps = {
  selectedList: string;
  x: string;
  y: string;
  groupBy: string;
  subweb: string;
  config: string;
};

export default class ChartsWebPart extends BaseClientSideWebPart<IChartsWebPartProps> {
  private lists: IPropertyPaneDropdownOption[];
  private availableFields: IPropertyPaneDropdownOption[];
  private listsDropdownDisabled: boolean = true;
  private fieldSelectsDisabled: boolean = true;

  public render(): void {
    // mystock.d3(d3);
    // mystock.c3(c3);
    // mystock.draw(this.domElement);
  }

  private loadLists(): Promise<IPropertyPaneDropdownOption[]> {
    return new Promise<IPropertyPaneDropdownOption[]>((resolve: (options: IPropertyPaneDropdownOption[]) => void, reject: (error: any) => void) => {
      web.lists.get().then((response) => {
        resolve(response.map((list) => ({key: list.Id, text: list.Title})));
      }).catch((error) => reject(error));
    });
  }

  private loadFields(): Promise<IPropertyPaneDropdownOption[]> {
    if (!this.properties.selectedList) {
      return Promise.resolve();
    }

    return new Promise<IPropertyPaneDropdownOption[]>((resolve: (options: IPropertyPaneDropdownOption[]) => void, reject: (error: any) => void) => {
      web.lists.getById(this.properties.selectedList).fields()
        .then((fields) => {
          resolve(fields.map((field) => ({key: `${this.properties.selectedList}-${field.Id}`, text: field.Title})));
        })
        .catch((error) => reject(error));
    });
  }

  protected onPropertyPaneConfigurationStart(): void {
    this.listsDropdownDisabled = !this.lists;

    if (this.lists) {
      return;
    }

    this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'lists');

    this.loadLists()
      .then((listOptions: IPropertyPaneDropdownOption[]): Promise<IPropertyPaneDropdownOption[]> => {
        this.lists = listOptions;
        this.listsDropdownDisabled = false;
        this.context.propertyPane.refresh();
        return this.loadFields();
      }).then((fieldOptions: IPropertyPaneDropdownOption[]): void => {
        this.availableFields = fieldOptions;
        this.fieldSelectsDisabled = !this.properties.selectedList;

        this.context.propertyPane.refresh();

        this.context.statusRenderer.clearLoadingIndicator(this.domElement);

        this.render();
      });
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    if (propertyPath === 'selectedList' && newValue) {
      super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
      
      this.fieldSelectsDisabled = true;
      
      this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'fields');

      this.loadFields()
        .then((fieldOptions: IPropertyPaneDropdownOption[]): void => {
          this.availableFields = fieldOptions;
          
          this.fieldSelectsDisabled = false;
          
          this.context.statusRenderer.clearLoadingIndicator(this.domElement);
          
          // this.render();

          this.context.propertyPane.refresh();
        });
    }
    else {
      super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    }
  }

  // protected onDispose(): void {
  //   ReactDom.unmountComponentAtNode(this.domElement);
  // }

  // protected get dataVersion(): Version {
  //   return Version.parse('1.0');
  // }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.SelectListGroupName,
              groupFields: [
                PropertyPaneDropdown('selectedList', {
                  label: strings.SelectListLabel,
                  options: this.lists,
                  disabled: this.listsDropdownDisabled
                }),
              ]
            },
            {
              groupName: strings.SelectDimensionsGroupName,
              groupFields: [
                PropertyPaneDropdown('x', {
                  label: strings.SelectXFieldLabel,
                  options: this.availableFields,
                  disabled: this.fieldSelectsDisabled
                }),
                PropertyPaneDropdown('y', {
                  label: strings.SelectYFieldLabel,
                  options: this.availableFields,
                  disabled: this.fieldSelectsDisabled
                }),
                PropertyPaneDropdown('groupBy', {
                  label: strings.SelectGroupByFieldLabel,
                  options: this.availableFields,
                  disabled: this.fieldSelectsDisabled
                }),
              ]
            },
            {
              groupName: strings.OptionsGroupName,
              groupFields: [
                PropertyPaneTextField('subWeb', {
                  label: strings.SubWebLabel,
                }),
                PropertyPaneTextField('config', {
                  label: strings.ConfigFieldLabel,
                  multiline: true
                }),
              ]
            },
          ]
        }
      ]
    };
  }
}
