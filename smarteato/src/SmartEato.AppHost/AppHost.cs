var builder = DistributedApplication.CreateBuilder(args);

// Add the SmartEato API service
var api = builder.AddProject<Projects.SmartEato_Api>("smarteato-api")
    .WithExternalHttpEndpoints();

// Add the React Native Mobile App (Expo)
// This will run "npm start" in the SmartEato.Mobile directory
/*var mobileAppPath = Path.Combine("..", "SmartEato.Mobile");
var mobileApp = builder.AddNpmApp("smarteato-mobile", mobileAppPath, "start")
    .WithHttpEndpoint(port: 8081, env: "PORT")
    .WithExternalHttpEndpoints();
*/

builder.AddDevTunnel("public-api")
    .WithReference(api)
    .WithAnonymousAccess();

builder.Build().Run();
