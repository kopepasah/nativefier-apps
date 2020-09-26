/**
 * Build Everything
 *
 * Handles the main build process of all native web applications.
 *
 * @package NativefierApps
 */

// Node Dependencies
const fs = require( 'fs' );
const path = require( 'path' );
const rimraf = require( 'rimraf' )

// External Dependencies
const nativefier = require( 'nativefier' ).default;

// Default Icon.
let icon = path.join( __dirname, 'assets', 'default.icns' );

// Default Options.
const options = {
	out            : path.resolve( __dirname, 'dist' ) ,
	overwrite      : true,
	icon           : icon,
	counter        : false,
	bounce         : false,
	showMenuBar    : true,
	fastQuit       : false,
	userAgent      : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
	insecure       : false,
	fullScreen     : true,
	maximize       : true,
	singleInstance : true,
	hideWindowFrame: false,
}

for ( const appDirName of fs.readdirSync( path.resolve( __dirname, 'apps' ) ) ) {
	// Set the actual App path.
	const appPath   = path.resolve( __dirname, 'apps', appDirName );
	const appConfig = path.resolve( appPath, 'app.json' );
	const appIcon   = path.resolve( appPath, 'app.icns' );

	// Fail early, if no config file is found.
	if ( ! fs.existsSync( appConfig ) ) {
		console.log( `Failed to load App configuration file for ${ appDirName }.` );
		continue;
	}

	// Get the app options.
	const appOptions = require( appConfig );

	// If there is a custom icon, use it.
	if ( fs.existsSync( appIcon ) ) {
		appOptions.icon = appIcon;
	}

	appOptions.out = path.resolve( options.out, appDirName );

	/**
	 * Nativefier Method
	 *
	 * @param object options Nativefier options.
	 * @param function Callback.
	 *
	 * @return void
	 */
	nativefier( { ...options, ...appOptions }, ( err, builtPath ) => {
		if (err) throw err;

		const fullAppPath = path.resolve( builtPath, appDirName + '.app' );

		// Bail if the app is not found, for some odd reason or another.
		if ( ! fs.existsSync( fullAppPath ) ) {
			console.log( `No App found: ${ fullAppPath }` );
			return;
		}

		const newAppPath = path.resolve( fullAppPath.replace( `${ appDirName }/${ path.basename( builtPath ) }` , '' ) );

		if ( fs.existsSync( newAppPath ) ) {
			rimraf.sync( newAppPath );
		}

		fs.renameSync( fullAppPath, newAppPath );
		rimraf.sync( path.dirname( builtPath ) );
	} );
}
