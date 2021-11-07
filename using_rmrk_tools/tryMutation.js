const fetch = require('node-fetch');

/*
    {
        "id": "pysBXS_nN",
        "block": "9468350",
        "rmrk": {
          "caller": "G5JgAXHwvSPxp4WsV2Lpo3rTvqPNWoUNEVKPV49MQY5raRG",
          "interactionType": "LIST",
          "remark": "RMRK::LIST::2.0.0::8949167-e0b9bdcc456a36497a-KANBIRD-KANL-00005292::7125000000000",
          "rmrkVersion": "2.0.0",
          "extraEx": null
        }
      }
      */
var query = `mutation CreateRmrkEntity($input: RmrkEntityCreateInput) {
  createEntity(input: $input) {
    id
  }
}`;

fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables: {
      input: {
        // "id": "pysBXS_nN",
        "block": "9468351",
        "rmrk": {
          "caller": "G5JgAXHwvSPxp4WsV2Lpo3rTvqPNWoUNEVKPV49MQY5raRG",
          "interactionType": "LIST",
          "remark": "RMRK::LIST::2.0.0::8949167-e0b9bdcc456a36497a-KANBIRD-KANL-00005292::7125000000000",
          "rmrkVersion": "2.0.0",
          "extraEx": null
        }
      }
    }
  })
})
  .then(r => r.json())
  .then(data => console.log('data returned:', data));
