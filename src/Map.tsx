import React, { Component, useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, ZoomControl } from "react-leaflet";

import database from './database';
import { MapType } from "./Models/MapType.enum";
import { get, onChildChanged, ref } from "firebase/database";
import { Position } from "./Models/position.model";
import "leaflet";
import "leaflet-routing-machine";
import equal from "fast-deep-equal";
import courierIcon from './assets/courierIcon.png';
import packageIcon from './assets/packageIcon.png';
import { ws } from "./websocket";
import { API_ENDPOINT, OSRM_URL } from "./constants";

declare let L: any;

interface IProps {
    type: MapType;
    id: string;
    children?: JSX.Element[] | JSX.Element;
    waypoints?: any[];
    isLocal: boolean;
    token: string;
}

interface IMapProps {
    type: MapType;
    id: string;
    children?: JSX.Element[] | JSX.Element;
    waypoints?: any[];
}

interface IState {
    map: JSX.Element;
}

const courierMarker = L.icon({
    iconUrl: courierIcon,
    iconRetinaUrl: courierIcon,
    iconSize: [58, 58],
    iconAnchor: [32, 58],
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    className: 'courierIcon'
});
const packageIconMarker = L.icon({
    iconUrl: packageIcon,
    iconRetinaUrl: packageIcon,
    iconSize: [58, 58],
    iconAnchor: [32, 58],
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    className: 'packageIcon'
});

const MapParentContainer = (props: IProps) => {
    const [courierWaypoints, setCourierWaypoints] = useState<any[]>([]);
    const [packageWaypoints, setPackageWaypoints] = useState<any[]>([]);
    const [packageCourierId, setPackageCourierId] = useState<string>('');
    const [wasHandshake, setWasHandshake] = useState<boolean>(false);

    if (!wasHandshake && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ id: props.id, type: props.type }));
        setWasHandshake(true);
    }

    useEffect(() => {
        if (!wasHandshake && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ id: props.id, type: props.type }));
            setWasHandshake(true);
        }
        if (props.type !== MapType.package) {
            getWaypointsForCourier(props.id);
        } else {
            getWaypointsForPackage(props.id);
        }
    }, [props.type, props.id, wasHandshake]);

    const getWaypointsForCourier = async (id: string) => {
        if (props.isLocal) {
            const courier = await (await get(ref(database, `couriers/${id}`))).val();
            const positions: Position[] = [];
            positions.push(courier.startPosition);
            const currentPackage = await (await get(ref(database, `packages/${courier.currentPackages}`))).val();
            positions.push(currentPackage.position);
            await Promise.all(courier.undeliveredPackages.map(async (id: string) => {
                positions.push(await (await get(ref(database, `packages/${id}`))).val().position);
            }));
            setCourierWaypoints(positions);
        } else { //socket
            const request = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': props.token,
                    'Accept': 'application/json',
                },

            };
            const response = await fetch(`${API_ENDPOINT}/couriers/route/${id}`, request)
                .then(response => response.json()
                    .then(data => data));

            setCourierWaypoints(response as unknown as Position[]);
        }
    }

    const getWaypointsForPackage = async (id: string) => {
        if (props.isLocal) {
            const packageRoute: Position[] = [];
            let courierId = '';
            const packageModel = await (await get(ref(database, `packages/${id}`))).val();
            const couriers = await (await get(ref(database, `couriers`))).val();
            Object.keys(couriers).forEach((curId) => {
                if (couriers[curId].currentPackages !== null && couriers[curId].currentPackages.id === id) {
                    courierId = couriers[curId].employeeNumber;
                    packageRoute.push(couriers[curId].startPosition);
                }
                if (couriers[curId].undeliveredPackages)
                    couriers[curId].undeliveredPackages.forEach((p: string) => {
                        if (p === id) {
                            courierId = couriers[curId].employeeNumber;
                            packageRoute.push(couriers[curId].startPosition);
                        }
                    });
            });
            packageRoute.push(packageModel.position);
            setPackageCourierId(courierId);
            setPackageWaypoints(packageRoute);
        } else { //socket
            const request = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': props.token,
                    'Accept': 'application/json'
                }
            };
            const response = await fetch(`${API_ENDPOINT}/packages/route/${id}`, request)
                .then(response => response.json()
                    .then(data => data));

            setPackageCourierId(response.courierId);
            setPackageWaypoints(response.positions as unknown as Position[]);
        }
    }

    if (props.type === MapType.courier) {
        if (props.isLocal) {
            const courierRef = ref(database, `couriers/${packageCourierId}`);
            onChildChanged(courierRef, async (data) => {
                if (data != null) {
                    getWaypointsForCourier(props.id);
                }
            });
        } else { //socket
            ws.onmessage = ((message) => {
                const data: { positions: Position[] } = JSON.parse(message.data);
                setCourierWaypoints(data.positions);
            });
        }
    }

    if (props.type === MapType.navigation) {
        if (props.isLocal) {
            const courierRef = ref(database, `couriers/${packageCourierId}`);
            onChildChanged(courierRef, async (data) => {
                if (data != null) {
                    getWaypointsForCourier(props.id);
                }
            });
        } else {
            ws.onmessage = ((message) => {
                const data: { positions: Position[] } = JSON.parse(message.data);
                setCourierWaypoints(data.positions);
            });
        }
    }

    if (props.type === MapType.package) {
        if (props.isLocal) {
            const courierRef = ref(database, `couriers/${props.id}`);

            onChildChanged(courierRef, async (data) => {
                if (data != null) {
                    getWaypointsForPackage(props.id);
                }
            })
        } else {
            ws.onmessage = ((message) => {
                const data: { positions: Position[] } = JSON.parse(message.data);
                setPackageWaypoints(data.positions);
            });
        }
    }

    return <Map type={props.type} id={props.id}
        waypoints={transformWaypoints(props.type === MapType.package ? packageWaypoints : courierWaypoints)} >
        <TileLayer
            //    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
    </Map>
}

const transformWaypoints = (positions: Position[]) => {
    const waypoints: any[] = [];
    if (positions) {
        positions.forEach((p) => {
            waypoints.push([p.latitude, p.longitude]);
        });
    }
    return waypoints;
}

class Map extends Component<IMapProps, IState> {
    constructor(props: IMapProps) {
        super(props);
        this.state = {
            map: this.getMap(),
        }
    }

    getMap(): JSX.Element {
        let center: [number, number] = [50, 20];
        if (this.props.waypoints && this.props.waypoints.length === 1) {
            center = [this.props.waypoints[0][0], this.props.waypoints[0][1]];
        }
        return <MapContainer
            center={center}
            zoom={13}
            zoomControl={true}
            id="mapId">
            {this.props.waypoints && this.props.waypoints.length !== 0 ? this.props.waypoints.map((wp, index) => {
                if (index === 0)
                    return <Marker key={Math.random()} position={wp} icon={courierMarker} />
                else return <Marker key={Math.random()} position={wp} icon={packageIconMarker} />
            }) : null}
            <PackageRoute
                type={this.props.type}
                waypoints={this.props.waypoints ? this.props.waypoints : []}
            />
            <ZoomControl position="topleft" />
            {this.props.children ? this.props.children : null}
        </MapContainer>
    }

    componentDidUpdate(prevProps: IProps) {
        if (!equal(this.props, prevProps)) {
            this.setState({
                map: <div></div>,
            });
            this.setState({
                map: this.getMap(),
            });
        }
    }

    render() {
        return this.state.map;
    }
}

let prevRoute: any = null;

function PackageRoute({ waypoints, type }: { waypoints: any[], type: MapType }) {
    const map = useMap();

    const route = L.Routing.control({
        waypoints: waypoints,
        serviceUrl: OSRM_URL,
        lineOptions: {
            styles: [
                {
                    color: "#287cfb",
                    opacity: 0.6,
                    weight: 4,
                },
            ],
        },
        createMarker: function () { return null; },
        fitSelectedRoutes: type === MapType.courier || type === MapType.package ? true : false,
        showAlternatives: false,
    });
    if (prevRoute !== null) map.removeControl(prevRoute);
    map.addControl(route);

    if (type === MapType.navigation && waypoints.length >= 1) {
        map.fitBounds([waypoints[0], waypoints[1]]);
    }

    prevRoute = route;
    return null;
}

export default MapParentContainer;
