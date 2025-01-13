// Imports
//

// Lib
import { makePage } from './page/mod.ts';

import {
	RESPONSE_ERROR,
	RESPONSE_FILE,
	RESPONSE_NOT_FOUND,
	RESPONSE_OK_HTML,
} from './utils/mod.ts';

import { fileExists, join, makeContext } from './utils/mod.ts';

import { logger } from './logging/mod.ts';

// Constants
import * as Constants from './constants/mod.ts';

// config.ts
// const config = await import('./config.json', { with: { type: 'json' } });

/**
 * Match path if page or publics
 * @param path
 * @returns
 */
async function getTypeOfPath(path: string): Promise<[string, string]> {
	//
	// o ____   ____   ____
	//        v      v
	//      page   public ..

	// Init
	let type: string = Constants.NOT_FOUND;

	logger.info({ type, path });

	// Test 1 .. "index.page" | "home.page"
	//
	if (path == '/') {
		// "index.page"
		const indexPath = './' +
			join(Constants.SRC_DIR, Constants.PAGES_DIR, Constants.PAGE_INDEX);
		const indexExists = await fileExists(indexPath);
		if (indexExists) {
			path = '/' + Constants.PAGE_INDEX;
			type = Constants.TYPE_PAGE;
		}

		// "home.page"
		const homePath = './' +
			join(Constants.SRC_DIR, Constants.PAGES_DIR, `home.page`);
		const homeExists = await fileExists(homePath);
		if (homeExists) {
			path = '/' + Constants.PAGE_HOME;
			type = Constants.TYPE_PAGE;
		}
	}

	logger.info({ type, path });

	// Test 2 .. Page files
	//
	if (type == Constants.NOT_FOUND) {
		const filePath = './' +
			join(Constants.SRC_DIR, Constants.PAGES_DIR, `${path}.page`);
		const pageExists = await fileExists(filePath);
		if (pageExists) {
			type = Constants.TYPE_PAGE;
			path = `${path}.page`;
		}
	}

	logger.info({ type, path });

	// Test 3 .. Public files
	//
	if (type == Constants.NOT_FOUND) {
		const filePath = './' + join(Constants.PUBLIC_DIR, path);
		const publicFileExists = await fileExists(filePath);
		if (publicFileExists) {
			type = Constants.TYPE_PUBLIC;
		}
	}

	logger.info({ type, path });

	// 4. NOT FOUND in PAGES or PUBLIC Folder
	//
	if (type == Constants.NOT_FOUND) {
		type = Constants.NOT_FOUND;
	}

	return [type, path];
}

/**
 * Serve pages from "/src/pages/*.**"
 * @param path
 * @param request
 * @returns
 */
async function servePage(path: string, request: Request): Promise<Response> {
	// Init
	//
	const filepath = './' + join(Constants.SRC_DIR, Constants.PAGES_DIR, path);

	logger.info('servePage', filepath);

	// Check again
	//
	if (await fileExists(filepath) == false) {
		return RESPONSE_NOT_FOUND();
	}

	// Make Context
	//
	const context = makeContext(request);

	// Make Page
	//
	const [squirrel, error] = await makePage(path, context);
	if (error != null) {
		logger.error(error);
	}

	// Serve it
	//
	if (error == null) {
		return RESPONSE_OK_HTML(squirrel);
	} else {
		return RESPONSE_ERROR();
	}
}

/**
 * Serve files from public folder "/public/*.**"
 * @param path
 * @param request
 * @returns
 */
async function servePublics(path: string, request: Request): Promise<Response> {
	// Check if file NOT exists -> 404
	//
	const filepath = join(Constants.PUBLIC_DIR, path);

	// If exists --> 200
	//
	// @ts-ignore:
	const file: Uint8Array = await Deno.readFile(filepath);

	// Serve It
	//
	return RESPONSE_FILE(file, path);
}

/**
 * Serve Files
 *
 *   http://server.com/index_1 -> src/page/index_1
 *
 * @param path
 * @param context
 * @returns
 */
async function serveFiles(request: Request): Promise<Response> {
	// Init
	//
	const url = new URL(request.url);

	// Get type of path PAGE or PUBLICS
	//
	const [type, path] = await getTypeOfPath(url.pathname);

	// PAGE Files from "/src/pages"
	//
	if (type == Constants.TYPE_PAGE) {
		return await servePage(path, request);
	}

	// PUBLIC Files from "/public/"-Folder
	//
	if (type == Constants.TYPE_PUBLIC) {
		return await servePublics(path, request);
	}

	return RESPONSE_NOT_FOUND();
}

/**
 * Default request handler
 */
export default {
	async fetch(request: Request) {
		try {
			return await serveFiles(request);
		} catch (error) {
			logger.error(error);
			return RESPONSE_ERROR();
		}
	},
};

// > deno serve --allow-read --allow-write --allow-net server.ts
