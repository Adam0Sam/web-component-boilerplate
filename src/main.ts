import { defineRegisteredComponents } from './components';

async function initializeApp() {
	try {
		await defineRegisteredComponents();
		console.log('All components registered successfully!');
	} catch (error) {
		console.error('Failed to initialize components:', error);
	}
}
initializeApp();
