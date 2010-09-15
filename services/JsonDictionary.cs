using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace ODataJS.services
{
    [Serializable]
    public class JsonDictionary : ISerializable
    {
        readonly Dictionary<string, object> _dict = new Dictionary<string, object>();
        public JsonDictionary() { }
        protected JsonDictionary(SerializationInfo info, StreamingContext context)
        {
            foreach (var entry in info)
            {
                _dict.Add(entry.Name, entry.Value);
            }
        }

        public void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            foreach (string key in _dict.Keys)
            {
                info.AddValue(key, _dict[key], _dict[key] == null ? 
					typeof(object) : 
					_dict[key].GetType());
            }
        }

        public void Add(string key, object value)
        {
            _dict.Add(key, value);
        }
    }
}