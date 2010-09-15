using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web;

namespace ODataJS.services
{
    public class AjaxPingHandler : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;

            // serialize PingReply object
            string jsonText = string.Empty;
            using (var ms = new MemoryStream())
            {
                var jsonSerializer = new DataContractJsonSerializer(typeof(PingReply));
                jsonSerializer.WriteObject(ms, new PingReply(request));
                jsonText = Encoding.Default.GetString(ms.ToArray());
            }

            // set content type to json
            response.ContentType = request.AcceptTypes.Contains("application/json") ? 
				"application/json" : 
				"text/javascript";

            // wrap in d object to avoid script injection
            jsonText = "{\"d\":{" + jsonText.Substring(1, jsonText.Length - 1) + "}";

            // output content
            response.Write(jsonText);            
        }

        public bool IsReusable
        {
            // To enable pooling, return true here.
            // This keeps the handler in memory.
            get { return false; }
        }
    }
}