import React from 'react';
import './App.css';
import { MapType } from './Models/MapType.enum';

import MapParentContainer from './Map';
import { ws } from './websocket';

interface IProps { }

interface IState {
  type: MapType,
  id: string,
  isLocalDev: boolean,
  token: string
}

export default class App extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    const url = new URL(window.location.href);
    const type = MapType[url.searchParams.get("type") as string as keyof typeof MapType];
    if (!type) console.log('%cMissing Type parameter in url', 'color: red');
    const id = url.searchParams.get('id') as string;
    const isLocalDev = url.searchParams.get('isLocalDev') === 'true';
    if (!isLocalDev) console.log('%cLocalDevSetToFalse', 'color: orange');
    else console.log('%cLocalDevSetToTrue', 'color: orange');
    if (!id) console.log('%cMissing id parameter in url', "color: red");
    const token = url.searchParams.get('token') as string;

    this.state = {
      type: type ?? MapType.package,
      id: id ?? '',
      isLocalDev: isLocalDev,
      token: token ?? '',
    }
  }

  handleEvent = (id: string, type: string, isLocalDev: string, token: string) => {
    this.setState({
      type: MapType[type as keyof typeof MapType],
      id: id,
      isLocalDev: isLocalDev === 'true',
      token: token
    });
  }

  componentDidMount() {
    ws.onopen = () => {
      console.log("%cWebSocket Client Connected", 'color: green');
    };
    ws.onerror = (e) => {
      const str = JSON.stringify(e, ["message", "arguments", "type", "name"]);
      console.log('%cwebsocket error: ' + str, 'color: red');
    }
    window.addEventListener("flutterInAppWebViewPlatformReady", (event) => {
      (window as any).flutter_inappwebview.callHandler('navigationHandler', 'test')
        .then((data: any) => {
          this.handleEvent(data.id, data.type, data.isLocalDev, data.token);
        });
    });
  }

  render() {
    return this.state.token !== ''
      ? (<div className="App" style={{ width: '100vw', height: '100vh' }}>
        <MapParentContainer type={this.state.type} id={this.state.id} isLocal={this.state.isLocalDev} token={this.state.token} />
      </div>
      )
      : <div style={{ fontSize: '32px', color: 'red', fontWeight: 'bold' }}>Missing Authorization Token</div>
  };
}
