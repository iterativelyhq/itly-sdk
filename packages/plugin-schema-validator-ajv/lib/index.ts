
/* eslint-disable no-unused-vars, class-methods-use-this */
import Ajv from 'ajv';
import {
  ItlyOptions,
  ItlyEvent,
  ItlyPluginBase,
  ValidationResponse,
} from '@itly/sdk-core';

export default class SchemaValidatorAjvPlugin extends ItlyPluginBase {
  static ID: string = 'schema-validator-ajv';

  private environment: 'development' | 'production';

  private schemas: { [id: string]: any };

  private validators: { [id: string]: any };

  private ajv: Ajv.Ajv;

  constructor(schemas: { [id: string]: any }) {
    super();
    this.environment = 'production';
    this.schemas = schemas;
    this.ajv = new Ajv();
    this.validators = {};
  }

  id = () => SchemaValidatorAjvPlugin.ID;

  load(options: ItlyOptions) {
    this.environment = options.environment || this.environment;
  }

  validate(event: ItlyEvent): ValidationResponse {
    // Check that we have a schema for this event
    if (!this.schemas[event.id]) {
      return {
        valid: false,
        message: `Event ${event.name} not found in tracking plan.`,
        pluginId: this.id(),
      };
    }

    // Compile validator for this event if needed
    if (!this.validators[event.id]) {
      this.validators[event.id] = this.ajv.compile(this.schemas[event.id]);
    }

    const validator = (this.validators[event.id]);
    if (event.properties && !(validator(event.properties) === true)) {
      const errors = validator.errors.map((e: any) => {
        let extra = '';
        if (e.keyword === 'additionalProperties') {
          extra = ` (${e.params.additionalProperty})`;
        }
        return `\`properties${e.dataPath}\` ${e.message}${extra}.`;
      }).join(' ');

      return {
        valid: false,
        message: `Passed in ${event.name} properties did not validate against your tracking plan. ${errors}`,
        pluginId: this.id(),
      };
    }

    return { valid: true };
  }

  // FIXME: I don't think we need to provide implementation for this as
  // FIXME: now the developer can make there own plugin and handle it how they want
  validationError(validationResponse: ValidationResponse, event: ItlyEvent) {
    const { message } = validationResponse;
    if (this.environment !== 'production') {
      // eslint-disable-next-line no-console
      throw new Error(message);
    }
  }
}