import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const INSTALLER_URL =
	'https://github.com/jtaw5649/barforge-app/releases/latest/download/barforge-bin-installer.sh';

export const GET: RequestHandler = () => {
	redirect(301, INSTALLER_URL);
};
