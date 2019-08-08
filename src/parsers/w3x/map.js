import BinaryStream from "../../common/binarystream";
import MpqArchive from "../mpq/archive";
import IniFile from "../ini/file";
import War3MapDoo from "./doo/file";
import War3MapImp from "./imp/file";
// import War3MapMmp from './mmp/file';
// import War3MapShd from './shd/file';
// import War3MapW3c from './w3c/file';
import War3MapW3d from "./w3d/file";
import War3MapW3e from "./w3e/file";
import War3MapW3i from "./w3i/file";
// import War3MapW3o from './w3o/file';
// import War3MapW3r from './w3r/file';
// import War3MapW3s from './w3s/file';
import War3MapW3u from "./w3u/file";
import War3MapWct from "./wct/file";
// import War3MapWpm from './wpm/file';
import War3MapWtg from "./wtg/file";
import War3MapWts from "./wts/file";
import War3MapUnitsDoo from "./unitsdoo/file";

/**
 * Warcraft 3 map (W3X and W3M).
 */
export default class War3Map {

	/**
   * @param {?ArrayBuffer} buffer If given an ArrayBuffer, load() will be called immediately
   * @param {?boolean} readonly If true, disables editing and saving the map (and the internal archive), allowing to optimize other things
   */
	constructor( buffer, readonly ) {

		/** @member {number} */
		this.unknown = 0;
		/** @member {string} */
		this.name = "";
		/** @member {number} */
		this.flags = 0;
		/** @member {number} */
		this.maxPlayers = 0;
		/** @member {MpqArchive} */
		this.archive = new MpqArchive( null, readonly );
		/** @member {War3MapImp} */
		this.imports = new War3MapImp();
		/** @member {boolean} */
		this.readonly = !! readonly;

		if ( buffer )
			this.load( buffer );

	}

	/**
   * Load an existing map.
   * Note that this clears the map from whatever it had in it before.
   *
   * @param {ArrayBuffer} buffer
   * @return {boolean}
   */
	load( buffer ) {

		const stream = new BinaryStream( buffer );

		if ( stream.read( 4 ) !== "HM3W" )
			return false;

		// Read the header.
		this.u1 = stream.readUint32();
		this.name = stream.readUntilNull();
		this.flags = stream.readUint32();
		this.maxPlayers = stream.readUint32();

		// Read the archive.
		// If it failed to be read, abort.
		if ( ! this.archive.load( buffer ) )
			return false;

		// Read in the imports file if there is one.
		this.readImports();

		return true;

	}

	/**
   * Save this map.
   * If the archive is in readonly mode, returns null.
   *
   * @return {?ArrayBuffer}
   */
	save() {

		if ( this.readonly )
			return null;

		// Update the imports if needed.
		this.setImportsFile();

		const headerSize = 512;
		const archiveBuffer = this.archive.save();
		const buffer = new ArrayBuffer( headerSize + archiveBuffer.byteLength );
		const typedArray = new Uint8Array( buffer );
		const writer = new BinaryStream( buffer );

		// Write the header.
		writer.write( "HM3W" );
		writer.writeUint32( this.u1 );
		writer.write( `${this.name}\0` );
		writer.writeUint32( this.flags );
		writer.writeUint32( this.maxPlayers );

		// Writer the archive.
		typedArray.set( new Uint8Array( archiveBuffer ), headerSize );

		return buffer;

	}

	/**
   * A shortcut to the internal archive function.
   *
   * @return {Array<string>}
   */
	getFileNames() {

		return this.archive.getFileNames();

	}

	/**
   * Gets a list of the file names imported in this map.
   *
   * @return {Array<string>}
   */
	getImportNames() {

		const names = [];

		for ( const entry of this.imports.entries.values() ) {

			const isCustom = entry.isCustom;

			if ( isCustom === 10 || isCustom === 13 )
				names.push( entry.name );
			else
				names.push( `war3mapImported\\${entry.name}` );

		}

		return names;

	}

	/**
   * Sets the imports file with all of the imports.
   * Does nothing if the archive is in readonly mode.
   *
   * @return {boolean}
   */
	setImportsFile() {

		if ( this.readonly )
			return false;

		if ( this.imports.entries.size > 0 )
			return this.set( "war3map.imp", this.imports.save() );

		return false;

	}

	/**
   * Imports a file to this archive.
   * If the file already exists, its buffer will be set.
   * Files added to the archive but not to the imports list will be deleted by the World Editor automatically.
   * This of course doesn't apply to internal map files.
   * Does nothing if the archive is in readonly mode.
   *
   * @param {string} name
   * @param {ArrayBuffer} buffer
   * @return {boolean}
   */
	import( name, buffer ) {

		if ( this.readonly )
			return false;

		if ( this.archive.set( name, buffer ) ) {

			this.imports.set( name );

			return true;

		}

		return false;

	}

	/**
   * A shortcut to the internal archive function.
   *
   * @param {string} name
   * @param {ArrayBuffer} buffer
   * @return {boolean}
   */
	set( name, buffer ) {

		if ( this.readonly )
			return false;

		return this.archive.set( name, buffer );

	}

	/**
   * A shortcut to the internal archive function.
   *
   * @param {string} name
   * @return {?MpqFile}
   */
	get( name ) {

		return this.archive.get( name );

	}

	/**
   * Get the map's script file.
   *
   * @return {?MpqFile}
   */
	getScript() {

		const file = this.get( "war3map.j" ) || this.get( "scripts\\war3map.j" );

		return file.text();

	}

	/**
   * A shortcut to the internal archive function.
   *
   * @param {string} name
   * @return {boolean}
   */
	has( name ) {

		return this.archive.has( name );

	}

	/**
   * Deletes a file from the internal archive.
   * Note that if the file is in the imports list, it will be removed from it too.
   * Use this rather than the internal archive's delete.
   *
   * @param {string} name
   * @return {boolean}
   */
	delete( name ) {

		if ( this.readonly )
			return false;

		// If this file is in the import list, remove it.
		this.imports.delete( name );

		return this.archive.delete( name );

	}

	/**
   * A shortcut to the internal archive function.
   *
   * @param {string} name
   * @param {string} newName
   * @return {boolean}
   */
	rename( name, newName ) {

		if ( this.readonly )
			return false;

		if ( this.archive.rename( name, newName ) ) {

			// If the file was actually renamed, and it is an import, rename also the import entry.
			this.imports.rename( name, newName );

			return true;

		}

		return false;

	}

	/**
   * @param {string} path
   * @param {Constructor} Constructor
   * @return {Constructor|null|undefined}
   */
	readHelper( path, Constructor ) {

		const file = this.archive.get( path );

		if ( file ) {

			const buffer = file.arrayBuffer();

			if ( buffer )
				return new Constructor( buffer );

			return null;

		}

		return undefined;

	}

	/**
   * Read the imports file.
   */
	readImports() {

		const file = this.archive.get( "war3map.imp" );

		if ( file ) {

			const buffer = file.arrayBuffer();

			if ( buffer )
				this.imports.load( buffer );

		}

	}

	/**
   * Read the map information file.
   *
   * @return {?War3MapW3i}
   */
	readMapInformation() {

		return this.readHelper( "war3map.w3i", War3MapW3i );

	}

	/**
   * Read the environment file.
   *
   * @return {?War3MapW3e}
   */
	readEnvironment() {

		return this.readHelper( "war3map.w3e", War3MapW3e );

	}

	/**
   * Read and parse the doodads file.
   *
   * @return {?War3MapDoo}
   */
	readDoodads() {

		const file = this.archive.get( "war3map.doo" );

		if ( file )
			return new War3MapDoo( file.arrayBuffer() );

	}

	/**
   * Read and parse the units file.
   *
   * @return {?War3MapUnitsDoo}
   */
	readUnits() {

		const file = this.archive.get( "war3mapUnits.doo" );

		if ( file )
			return new War3MapUnitsDoo( file.arrayBuffer() );

	}

	/**
   * Read and parse the trigger file.
   *
   * @param {TriggerData} triggerData
   * @return {?War3MapWtg}
   */
	readTriggers( triggerData ) {

		const file = this.archive.get( "war3map.wtg" );

		if ( file )
			return new War3MapWtg( file.arrayBuffer(), triggerData );

	}

	/**
   * Read and parse the custom text trigger file.
   *
   * @return {?War3MapWct}
   */
	readCustomTextTriggers() {

		const file = this.archive.get( "war3map.wct" );

		if ( file )
			return new War3MapWct( file.arrayBuffer() );

	}

	/**
   * Read and parse the string table file.
   *
   * @return {?War3MapWts}
   */
	readStringTable() {

		const file = this.archive.get( "war3map.wts" );

		if ( file )
			return new War3MapWts( file.text() );

	}

	/**
   * Read and parse all of the modification tables.
   *
   * @return {Map}
   */
	readModifications() {

		const modifications = {};

		// useOptionalInts:
		//      w3u: no (units)
		//      w3t: no (items)
		//      w3b: no (destructables)
		//      w3d: yes (doodads)
		//      w3a: yes (abilities)
		//      w3h: no (buffs)
		//      w3q: yes (upgrades)
		const fileNames = [ "w3u", "w3t", "w3b", "w3d", "w3a", "w3h", "w3q" ];
		const useOptionalInts = [ false, false, false, true, true, false, true ];

		for ( let i = 0, l = fileNames.length; i < l; i ++ ) {

			const file = this.archive.get( `war3map.${fileNames[ i ]}` );

			if ( file ) {

				const buffer = file.arrayBuffer();
				let modification;

				if ( useOptionalInts[ i ] )
					modification = new War3MapW3d( buffer );
				else
					modification = new War3MapW3u( buffer );

				modifications[ fileNames[ i ] ] = modification;

			}

		}

		return modifications;

	}

	bufferToString( buffer ) {

		let out = "";
		let i = 0;

		const len = buffer.length;
		while ( i < len ) {

			const c = buffer[ i ++ ];
			switch ( c >> 4 ) {

				case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:

					// 0xxxxxxx
					out += String.fromCharCode( c );
					break;

				case 12: case 13: {

					// 110x xxxx   10xx xxxx
					const char2 = buffer[ i ++ ];
					out += String.fromCharCode( ( c & 0x1F ) << 6 | char2 & 0x3F );
					break;

				}
				case 14: {

					// 1110 xxxx  10xx xxxx  10xx xxxx
					const char2 = buffer[ i ++ ];
					const char3 = buffer[ i ++ ];
					out += String.fromCharCode( ( c & 0x0F ) << 12 |
							( char2 & 0x3F ) << 6 |
							( char3 & 0x3F ) << 0 );
					break;

				}

			}

		}

		return out;

	}

	/**
   * Read and parse map gameplay constants
   */
	readGameplayConstants() {

		const file = this.archive.get( "war3mapMisc.txt" );
		if ( file ) return new IniFile( this.bufferToString( new Uint8Array( file.arrayBuffer() ) ) );

	}

	/**
   * Read and parse map game interface
   */
	readGameInterface() {

		const file = this.archive.get( "war3mapSkin.txt" );
		if ( file ) return new IniFile( this.bufferToString( new Uint8Array( file.arrayBuffer() ) ) );

	}

	/**
* Read and parse map game interface
*/
	readMapProperties() {

		const file = this.archive.get( "war3mapExtra.txt" );
		if ( file ) return new IniFile( this.bufferToString( new Uint8Array( file.arrayBuffer() ) ) );

	}

}
