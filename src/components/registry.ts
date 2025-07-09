type ComponentRegistryEntry = {
	observedAttributes: Array<string>;
};

export class ComponentRegistry {
	private static _instance: ComponentRegistry;
	private _components: Map<string, ComponentRegistryEntry> = new Map();

	private constructor() {
		throw new Error('Use getInstance() to access the registry');
	}

	public static getInstance(): ComponentRegistry {
		if (!ComponentRegistry._instance) {
			ComponentRegistry._instance = new ComponentRegistry();
		}
		return ComponentRegistry._instance;
	}

	public registerComponent(
		tagName: string,
		registryEntry: ComponentRegistryEntry,
	) {
		if (this._components.has(tagName)) return;
		this._components.set(tagName, registryEntry);
	}

	public getRegisteredComponentEntries() {
		return Array.from(this._components.entries());
	}
}
