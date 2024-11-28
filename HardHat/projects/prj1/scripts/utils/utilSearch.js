
function getTokenName(config, tokenaddress) {
    return findKeyByValue(config, tokenaddress);
}

function getRouterName(config, routerAddress) {
    return findKeyByValue(config, routerAddress);

}

function findKeyByValue(config, address) {
    for (let key in config) {
        if (config[key] === address) {
            return key;
        } else if (typeof config[key] === 'object' && config[key] !== null) {
            let nestedKey = findKeyByValue(config[key], address);
            if (nestedKey) {
                //return key + '.' + nestedKey;
                return nestedKey;
            }
        }
    }
    return null; // Return null if the value isn't found
}

module.exports = { getRouterName, getTokenName

}; 