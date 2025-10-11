var builder = DistributedApplication.CreateBuilder(args);

// Add the SmartEato API service
var api = builder.AddProject<Projects.SmartEato_Api>("smarteato-api")
    .WithExternalHttpEndpoints();

builder.Build().Run();
