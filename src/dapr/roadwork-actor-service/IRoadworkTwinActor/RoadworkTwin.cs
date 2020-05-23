using System.Threading.Tasks;
using Dapr.Actors;

namespace IRoadworkTwinActorInterface
{
    public class RoadworkTwin
    {
        public string DeviceId { get; set; }
        public string Source { get; set; }
        public string LastUpdated { get; set; }
        public string State { get; set; }

        public override string ToString()
        {
            var deviceId = this.DeviceId ?? "null";
            var source = this.Source ?? "null";
            var lastUpdated = this.LastUpdated ?? "null";
            var state = this.State ?? "null";

            return $"[{source}][{deviceId}] {state}";
        }
    }
}