import $q from 'q';
import loadDBC from './../dbcLoader.js';


const mapDBCFile = {};


export default function mapDBC(){
    var deferred = $q.defer();

    if (mapDBCFile === undefined) {
        var promise = loadDBC("DBFilesClient/Map.dbc");

        promise.then(function(dbcObject){
            for (var i = 0; i < dbcObject.getRowCount(); i++ ) {
                var mapDBCRecord = {};

                mapDBCRecord.id      = dbcObject.readInt32(i, 0);
                mapDBCRecord.mapName = dbcObject.readText(i, 1);
                mapDBCRecord.wdtName = dbcObject.readText(i, 5);

                mapDBCFile[mapDBCRecord.id] = mapDBCRecord;
            }

            deferred.resolve(mapDBCFile);
        }, function (error) {
            deferred.reject();
        });
    } else {
        deferred.resolve(mapDBCFile);
    }

    return deferred.promise;
}
