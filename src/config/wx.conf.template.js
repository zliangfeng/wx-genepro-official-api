const wx_config =
    process.env.NODE_ENV === "production"
        ? {
              appId: "wx81b1d4f5b98ee3b4",
              appSecret: "",
              appToken: "GeneProWX2017",
              encodingAESKey: "EmWdmITZZNWJyDAoi7y8XSAwgXPCJOwsWvhSBNqSgLD",
              domain: "m.jiyinhome.com",
              cache_json_file: "./",
              cache_max_age: 30 * 60 * 1000
          }
        : {
              appId: "wx1a83f688511b9595",
              appSecret: "",
              appToken: "GeneProWX2017",
              encodingAESKey: "kqFcbRJ4r6FCh3BR8ADle79DDBBjKrLYAihPmKsnK35",
              domain: "wxtest.jiyinhome.com",
              cache_json_file: "./",
              cache_max_age: 30 * 60 * 1000
          };

export default wx_config;
