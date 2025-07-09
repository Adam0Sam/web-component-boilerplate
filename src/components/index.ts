// Import all components to force js to parse their files and thus define the contained classes and thus evaluate the decorator factories (https://www.typescriptlang.org/docs/handbook/decorators.html#decorator-evaluation)

// Import statements are generated automatically

import { wrap } from '@/utils';
import { ComponentRegistry } from './registry';
import { pascalCase } from 'utils/case-utils';

export const defineRegisteredComponents = async () => {
	const componentRegistry = ComponentRegistry.getInstance();

	const promises = Array.from(
		componentRegistry.getRegisteredComponentEntries(),
	).map(async ([tagName, registryEntry]) => {
		try {
			if (customElements.get(tagName)) return;

			const customComponentConstructor = wrap(
				() => import(`${tagName}/${tagName}.component`),
				pascalCase(tagName),
				registryEntry.observedAttributes,
			);

			customElements.define(tagName, customComponentConstructor);
		} catch (error) {
			console.warn(`Failed to register component ${tagName}:`, error);
		}
	});

	await Promise.all(promises);
};
