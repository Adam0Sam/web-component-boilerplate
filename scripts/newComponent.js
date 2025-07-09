#! /usr/bin/env node
const caseUtils = require('../utils/case-utils');
const fs = require('fs-extra');
const { exec } = require('child_process');

const myArgs = process.argv.slice(2);
const nameComponent = myArgs[0];

const kebabNameComponent = caseUtils.kebabCase(nameComponent);
const pascalNameComponent = caseUtils.pascalCase(nameComponent);

const regexNameComponent = /{{cmpName}}/gm;
const regexNameComponentPascalCase = /{{cmpNamePascalCase}}/gm;

const componentsDir = `./src/components/${kebabNameComponent}`;
const cssDir = `${componentsDir}/styles`;

if (nameComponent) {
	// create a folder for the component class, css, and template
	fs.mkdirSync(componentsDir);

	// create a folder for the css filss
	fs.mkdirSync(cssDir);

	//////////
	// READ //
	//////////

	// read the class template
	let classTemplate = fs.readFileSync(
		'./scripts/templates/componentClass.template',
		'utf8',
	);
	classTemplate = classTemplate
		.replace(regexNameComponent, kebabNameComponent)
		.replace(regexNameComponentPascalCase, pascalNameComponent);

	// read the class definition type
	let classDefinitionTemplate = fs.readFileSync(
		'./scripts/templates/componentClassDefinition.template',
		'utf8',
	);
	classDefinitionTemplate = classDefinitionTemplate
		.replace(regexNameComponent, kebabNameComponent)
		.replace(regexNameComponentPascalCase, pascalNameComponent);

	// read the html template
	let htmlTemplate = fs.readFileSync(
		'./scripts/templates/componentHTML.template',
		'utf8',
	);
	htmlTemplate = htmlTemplate.replace(regexNameComponent, kebabNameComponent);

	// read the observed attributes template
	let observedAttributesTemplate = fs.readFileSync(
		'./scripts/templates/observedAttributes.template',
		'utf8',
	);

	// read main css
	let mainCssTemplate = fs.readFileSync(
		'./scripts/templates/mainCss.template',
		'utf8',
	);

	// read variables css
	let variablesCssTemplate = fs.readFileSync(
		'./scripts/templates/_variablesCss.template',
		'utf8',
	);

	///////////
	// WRITE //
	///////////

	// ts file
	fs.writeFileSync(
		`${componentsDir}/${kebabNameComponent}.component.ts`,
		classTemplate,
		function (err) {
			if (err) return console.log(err);
		},
	);
	console.log(`Created ${componentsDir}/${kebabNameComponent}.component.ts`);

	// d.ts file
	fs.writeFileSync(
		`${componentsDir}/${kebabNameComponent}.component.d.ts`,
		classDefinitionTemplate,
		function (err) {
			if (err) return console.log(err);
		},
	);
	console.log(`Created ${componentsDir}/${kebabNameComponent}.component.d.ts`);

	// ts observed attributes file
	fs.writeFileSync(
		`${componentsDir}/${kebabNameComponent}.observed-attributes.ts`,
		observedAttributesTemplate,
		function (err) {
			if (err) return console.log(err);
		},
	);
	console.log(`Created ${componentsDir}/${kebabNameComponent}.component.ts`);

	// html file
	fs.writeFileSync(
		`${componentsDir}/${kebabNameComponent}.html`,
		htmlTemplate,
		function (err) {
			if (err) return console.log(err);
		},
	);
	console.log(`Created ${componentsDir}/${kebabNameComponent}.html`);

	// css files
	fs.writeFileSync(
		`${componentsDir}/styles/main.css`,
		mainCssTemplate,
		function (err) {
			if (err) return console.log(err);
		},
	);
	console.log(`Created ${cssDir}/main.css`);

	fs.writeFileSync(
		`${cssDir}/_variables.css`,
		variablesCssTemplate,
		function (err) {
			if (err) return console.log(err);
		},
	);
	console.log(`Created ${cssDir}/_variables.css`);

	fs.writeFileSync(`${cssDir}/_modifiers.css`, '', function (err) {
		if (err) return console.log(err);
	});
	console.log(`Created ${cssDir}/_modifiers.css`);

	// update components/index.ts
	let componentsIndex = fs.readFileSync('./src/components/index.ts', 'utf8');

	// Find the end of the automatically generated import section
	const importSectionEnd = componentsIndex.indexOf('import { wrap }');

	if (importSectionEnd !== -1) {
		// Insert the new import statement before the existing imports
		const newImportStatement = `import './${kebabNameComponent}/${kebabNameComponent}.component';\n`;

		// Insert after the auto-generated comment but before the main imports
		componentsIndex =
			componentsIndex.slice(0, importSectionEnd) +
			newImportStatement +
			componentsIndex.slice(importSectionEnd);
	} else {
		// Fallback: add at the beginning if structure is different
		const newImportStatement = `import './${kebabNameComponent}/${kebabNameComponent}.component';\n`;
		componentsIndex = newImportStatement + componentsIndex;
	}

	// Write the updated components/index.ts
	fs.writeFileSync(
		'./src/components/index.ts',
		componentsIndex,
		function (err) {
			if (err) return console.log(err);
		},
	);
	console.log(`Added ${kebabNameComponent} import to components/index.ts`);

	exec(`git add ${componentsDir}`, (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
			return;
		}
		console.log(`Added ${kebabNameComponent} components to git`);
	});
} else {
	console.error("No component's name");
}
