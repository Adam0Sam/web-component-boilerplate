import { kebabCase } from '../utils/case-utils';
import { ComponentRegistry } from './components/registry';

interface IWebComponentDecorated extends IWebComponent {
	srcHtml: string;
	srcStyle: string;
}

interface OriginalComponentClassType {
	observedAttributes: Array<string>;
	new (...args: any[]): IWebComponentDecorated;
}

interface AttributeValue {
	name: string;
	oldValue: string;
	newValue: string;
}

export const wrap = (
	importFn: () => Promise<any>,
	className: string,
	observedAttributes: Array<string>,
) => {
	class CustomComponent extends HTMLElement {
		private _originalComp: IWebComponentDecorated =
			{} as IWebComponentDecorated;
		private _connected = false;
		private _originalConstruct: OriginalComponentClassType =
			{} as OriginalComponentClassType;
		private _changedAttributes = false;
		private _attrArr: Array<AttributeValue> = [];

		static originalObservedAttributes: any;

		static get observedAttributes(): Array<string> {
			return observedAttributes;
		}

		constructor() {
			super();

			const shadow = this.attachShadow({ mode: 'open' });

			importFn().then((module) => {
				this._originalConstruct = className
					? module[className]
					: module.default;

				this._originalComp = new this._originalConstruct(shadow, shadow.host);

				this._originalConstruct.prototype?.properties?.forEach(
					(prop: string) => {
						Object.defineProperty(this, prop, {
							get: () => {
								return (this._originalComp as any)[prop];
							},
							set: (val) => {
								(this._originalComp as any)[prop] = val;
							},
						});
					},
				);

				shadow.innerHTML = this._originalComp!.srcHtml;
				const firstChild = shadow.firstChild;

				const styleTag = document.createElement('style');
				styleTag.innerHTML = this._originalComp?.srcStyle;

				shadow.insertBefore(styleTag, firstChild);

				if (this._connected) {
					this._originalComp.connectedCallback();
					if (!this._changedAttributes) {
						this._attrArr.forEach((attr: AttributeValue) =>
							this._originalComp?.attributeChangedCallback(
								attr.name,
								attr.oldValue,
								attr.newValue,
							),
						);
						this._changedAttributes = true;
					}
				}

				this.dispatchEvent(new Event('ready'));
			});
		}

		connectedCallback() {
			this._connected = true;
		}

		disconnectedCallback() {
			this._originalComp?.disconnectedCallback();
		}

		adoptedCallback() {
			this._originalComp?.adoptedCallback();
		}

		attributeChangedCallback(name: string, oldValue: any, newValue: any) {
			if (!this._changedAttributes) {
				this._attrArr.push({ name, oldValue, newValue });
			} else {
				this._originalComp?.attributeChangedCallback(name, oldValue, newValue);
			}
		}
	}

	return CustomComponent;
};

type MetaDataComponent = {
	html?: string;
	style?: string;
	properties?: Array<string>;
	observedAttributes: Array<string>;
};

export function Component(meta: MetaDataComponent) {
	return (target: Function) => {
		target.prototype.srcHtml = meta?.html || '';
		target.prototype.srcStyle = meta?.style || '';
		target.prototype.properties = meta?.properties || [];

		const tagName = kebabCase(target.name);
		const observedAttributes = meta.observedAttributes || [];

		const componentRegistry = ComponentRegistry.getInstance();
		componentRegistry.registerComponent(tagName, { observedAttributes });
	};
}
