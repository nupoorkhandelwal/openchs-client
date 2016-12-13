import {getJSON} from '../../framework/http/requests';
import _ from "lodash";
import moment from "moment";

class ConventionalRestClient {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }

    loadData(entityModel, lastUpdatedLocally, pageNumber, allEntityMetaData, executePerResourcesWithSameTimestamp, executeNextResource, resourcesWithSameTimestamp) {
        const url = `${this.settingsService.getServerURL()}/${entityModel.resourceName}/search/lastModified?lastModifiedDateTime=${moment(lastUpdatedLocally).add(1, "ms").toISOString()}&size=5&page=${pageNumber}&sort=lastModifiedDateTime,asc`;
        console.log(`Calling: ${url}`);
        getJSON(url, (response) => {
            var resources = response["_embedded"][`${entityModel.resourceName}`];

            _.forEach(resources, (resource) => {
                console.log(resourcesWithSameTimestamp.length);
                if (resourcesWithSameTimestamp.length === 0)
                    resourcesWithSameTimestamp.push(resource);
                else if (resourcesWithSameTimestamp.length > 0 && resourcesWithSameTimestamp[0]["lastModifiedDateTime"] === resource["lastModifiedDateTime"])
                    resourcesWithSameTimestamp.push(resource);
                else {
                    executePerResourcesWithSameTimestamp(resourcesWithSameTimestamp, entityModel);
                    resourcesWithSameTimestamp = [resource];
                }
            });

            if (this.morePagesForThisResource(response)) {
                this.loadData(entityModel.resourceName, lastUpdatedLocally, pageNumber + 1, allEntityMetaData, executePerResourcesWithSameTimestamp, executeNextResource, resourcesWithSameTimestamp);
            } else if (resourcesWithSameTimestamp.length > 0) {
                executePerResourcesWithSameTimestamp(resourcesWithSameTimestamp, entityModel);
                executeNextResource(allEntityMetaData);
            } else {
                executeNextResource(allEntityMetaData);
            }
        });
    }

    morePagesForThisResource(response) {
        return response["page"]["number"] < (response["page"]["totalPages"] - 1);
    }
}

export default ConventionalRestClient;