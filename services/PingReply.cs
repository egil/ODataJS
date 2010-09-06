using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace ODataJS.services
{
    [DataContract]
    public class PingReply
    {
        [DataMember]
        public string HTTPVerb { get; set; }

        [DataMember]
        public JsonDictionary Headers { get; private set; }

        [DataMember]
        public JsonDictionary QueryString { get; private set; }        

        public PingReply(HttpRequest request)
        {
            Headers = new JsonDictionary();
            QueryString = new JsonDictionary();
            foreach (var key in request.Headers.AllKeys.Where(x=>x!=null))
                Headers.Add(key, request.Headers[key]);
            foreach (var key in request.QueryString.AllKeys.Where(x => x != null))
                QueryString.Add(key, request.QueryString[key]);

            HTTPVerb = request.HttpMethod;
        }
    }
}