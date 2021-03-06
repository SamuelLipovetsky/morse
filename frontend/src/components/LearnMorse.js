import React, { Component } from "react";
import { connect } from "react-redux";
import { resetLista } from "../actions/morseActions";
import {
  defHigh,
  defLow,
  createCTX,
  setContext,
  setPage
} from "../actions/morseActions";
import Popup from "reactjs-popup";

class LearnMorse extends Component {
  constructor() {
    super();
    // criando a referencia pra adicionar e remover o eventelistener
    this.upHandler = this.upHandler.bind(this);
    this.pressHandler = this.pressHandler.bind(this);

    this.context = new AudioContext();
    this.audio = new Audio();
    this.audio.src = "../static/rigth.mp3";

    this.audio.controls = true;
    this.audioWrong = new Audio();
    this.audioWrong.src = "../static/wrong.mp3";
    this.audioWrong.controls = true;
  }

  state = {
    learn: "",
    cm: [],
    lista: [],
    start: 0,
    end: 0,
    total: 0,
    key: "",
    dificuldade: 2,
    tempo: false,
    iniciado: false,
    level: 1
  };

  componentDidUpdate(prevP, prevS) {
    this.state.cm.map((obj, ind) => {
      this.state.lista.map(ls => {
        if (this.state.lista[ind]) {
          if (
            this.state.lista[ind] !== this.state.cm[ind] ||
            (this.state.start - this.state.end > 1400 && this.state.tempo)
          ) {
            console.log(this.state.lista[ind], this.state.cm[ind]);

            if (prevS.lista !== this.state.lista) {
              setTimeout(() => {
                this.audioWrong.volume = this.props.morse.volume;
                this.audioWrong.play();
              }, 100);
            }
            setTimeout(() => {
              this.setState({ lista: [] });
            }, 500);
          }
        }
      });
    });
    // compara se o codigo morse e a lista traduzida sao identicas
    //e escolhe um novo charact,e se forem difrente tbm

    if (
      prevS.lista.join(",") !== this.state.lista.join(",") &&
      this.state.cm.join(",") === this.state.lista.join(",") &&
      this.state.lista.join(",").length > 0
    ) {
      setTimeout(() => {
        this.pickRandom(), this.setState({ lista: [] });
        this.setState({ end: 0 });
      }, 700);
      this.audio.volume = this.props.morse.volume;
      setTimeout(() => {
        this.audio.play();
      }, 100);

      return;
    } else if (this.state.lista.length === 5) {
      setTimeout(() => {
        this.pickRandom(), this.setState({ lista: [] });
      }, 700);
      this.audio.volume = this.props.morse.volume;
      setTimeout(() => {
        this.audio.play();
      }, 100);
      return;
    }
  }

  componentDidMount() {
    // this.pickRandom();

    var element = document.getElementById("click");
    window.addEventListener("keypress", this.pressHandler);
    window.addEventListener("keyup", this.upHandler);
    element.addEventListener("mouseup", this.upHandler);
    element.addEventListener("mousedown", this.pressHandler);
    element.addEventListener("touchend", this.upHandler);
    element.addEventListener("touchstart", this.pressHandler);
  }
  pressHandler = e => {
    if (this.state.iniciado) {
      this.setState({ key: e.key });
      if (e) {
        if (e.key !== "Tab" && e.key !== "Alt" && !/^[0-9]$/i.test(e.key)) {
          e.preventDefault();
          if (this.props.morse.start === 0) {
            this.props.defHigh();
            this.setState({ start: Date.now() });
          }
        }
      } else {
        this.props.defHigh();
        this.setState({ start: Date.now() });
      }
    }
  };
  // se o marcado de tempo for true , o uphandler olha o  tmepo entre letra
  // caso contrario sempre marca o - ou.
  upHandler = e => {
    if (this.state.iniciado) {
      if (
        (this.state.tempo &&
          this.state.start - this.state.end >
            this.props.morse.speed * 3 -
              this.props.morse.speed * this.state.dificuldade &&
          this.state.start - this.state.end <
            this.props.morse.speed * 3 +
              this.props.morse.speed * this.state.dificuldade) ||
        this.state.start - this.state.end > 150000000 ||
        this.state.start - this.state.end < -150000000 ||
        this.state.lista.length === 0 ||
        !this.state.tempo
      ) {
        if (e) {
          //nao aciona os sons se as teclas forem numeros ou tab e alt
          if (
            e.key !== "Tab" &&
            e.key !== "Alt" &&
            !/^[0-9]$/i.test(e.key) &&
            e.key === this.state.key
          ) {
            e.preventDefault();
            setTimeout(() => this.props.defLow(), 15);
            this.setState({ end: Date.now() });
          }
        } else {
          //esse else serve para eventos que nao tem e tipo o mousdown e o mouseup
          setTimeout(() => this.props.defLow(), 15);
          this.setState({ end: Date.now() });
        }
        //zera o a lista de - e . se for maior que 4
        if (this.state.lista.length >= 4) {
          this.setState({ lista: [] });
        }
        //checa o tempo e a batida do codigo
        //tambem ve se nao é numero ou tab e alt para adicionar as batidas na lsita de - e .
        //redundante porem necessario :(
        if (
          e.key !== "Tab" &&
          e.key !== "Alt" &&
          !/^[0-9]$/i.test(e.key) &&
          e.key === this.state.key
        ) {
          if (
            (this.state.end - this.state.start >
              this.props.morse.speed * 3 -
                this.props.morse.speed * this.state.dificuldade &&
              this.state.end - this.state.start <
                this.props.morse.speed * 3 +
                  this.props.morse.speed * this.state.dificuldade) ||
            //se o !this.state.tempo se for maior que 3x difuculdade
            //sempre -
            (!this.state.tempo &&
              this.state.end - this.state.start >
                this.props.morse.speed * 3 -
                  this.props.morse.speed * this.state.dificuldade)
          ) {
            this.setState({ lista: [...this.state.lista, "-"] });
          } else if (
            this.state.end - this.state.start <
              this.props.morse.speed +
                this.props.morse.speed * this.state.dificuldade ||
            !this.state.tempo
          ) {
            this.setState({ lista: [...this.state.lista, "."] });
          }
        }
        this.setState({ set: false, int: 0 });
      } else {
        this.props.defLow();
        this.setState({ lista: [] });

        this.setState({ end: Date.now() });
        this.setState({ end: 0 });
      }
    }
  };
  play = () => {
    var total = 0;

    if (this.state.total === 0 && this.state.level <= 2) {
      // this.props.createCTX();

      this.state.cm.map((obj, ind) => {
        if (obj === "-") {
          setTimeout(() => {
            this.props.defHigh();
          }, total);
          setTimeout(() => {
            this.props.defLow();
          }, total + Number(this.props.morse.speed) * 3);
          total += Number(this.props.morse.speed) * 3;
        }
        if (obj === ".") {
          setTimeout(() => {
            this.props.defHigh();
          }, total);
          setTimeout(() => {
            this.props.defLow();
          }, total + Number(this.props.morse.speed));
          total += Number(this.props.morse.speed);
        }
        if (obj === " ") {
          total += Number(this.props.morse.speed) * 1;
        }

        if (obj === ",") {
          total += Number(this.props.morse.speed) * 1;
        }
        total += Number(this.props.morse.speed) * 3;
        this.setState({ total: total });
      });
      // limita o numero de veze que da pra rodar esse metodo
      setTimeout(() => {
        this.setState({ total: 0 });
      }, total);
    }
  };
  pickRandom = () => {
    var lett = "abcdefghijklmnopqrstuvwxyz";
    var int = Math.floor(Math.random() * 26);
    var learn = lett[int];
    for (var i in this.props.morse.letras) {
      if (learn == i) {
        this.setState({ cm: this.props.morse.letras[i].split("") });
      }
    }
    this.setState({ learn: learn });

    setTimeout(() => {
      this.play();
    }, 200);
  };
  onChange = e => {
    console.log(e.target.name, e.target.value);
    this.setState({ [e.target.name]: e.target.value });
    console.log(this.state.level);
  };
  componentWillUnmount() {
    // console.log("abc");
    window.removeEventListener("keypress", this.pressHandler);
    window.removeEventListener("keyup", this.upHandler);
    var element = document.getElementById("click");

    element.removeEventListener("mouseup", this.upHandler);
    element.removeEventListener("mousedown", this.pressHandler);
    element.removeEventListener("touchend", this.upHandler);
    element.removeEventListener("touchstart", this.pressHandler);
  }
  coverDisplay = () => {
    if (this.state.iniciado) {
      return "none";
    }
    return "block";
  };
  render() {
    return (
      <div>
        <div className="btn-group">
          <button
            className=" btn btn-outline-secondary btn-sm"
            onClick={() => {
              if (this.level != 3) this.play();
              else {
                <Popup modal>
                  {" "}
                  no nivel expert nao se pode tocar o codigo
                </Popup>;
              }
            }}
          >
            tocar
          </button>
          <Popup
            modal
            contentStyle={{ maxWidth: 320, width: "100%" }}
            trigger={
              <button className=" btn btn-outline-secondary btn-sm">
                ajuda
              </button>
            }
          >
            <div
              style={{
                minWidth: 300,
                minHeight: 100,
                textAlign: "center",
                margin: "auto"
              }}
            >
              <h3> ajuda</h3>
              <p>
                Clique na caixa ou aperte qualquer tecla, apertar por mais tempo
                resulta em um traço e por menos tempo resulta em um ponto.
              </p>
              <p>
                Os traços e pontos embaixo da letra representam essa letra em
                codigo morse.
              </p>
              <p>
                Replique o som que foi reproduzido para aprender as letras do
                morse.
              </p>
            </div>
          </Popup>
          <select
            name="level"
            value={this.level}
            className="btn btn-outline-secondary btn-sm"
            onChange={this.onChange}
          >
            <option value="1">novato</option>
            <option value="2">intermediário</option>
            <option value="3">expert</option>
          </select>
        </div>

        <p style={{ marginLeft: 10, fontSize: 50 }}>{this.state.learn}</p>

        <div style={{ width: "100% ", height: 25 }}>
          <div style={{ position: "relative", marginLeft: "0px" }}>
            <div style={{ display: "flex", position: "absolute" }}>
              {this.state.lista.map((obj, ind) => {
                if (this.state.level < 3) {
                  if (obj === "-") {
                    return (
                      <div
                        key={ind}
                        style={{
                          width: 75,

                          height: 25,
                          background: "green",
                          marginLeft: "10px",
                          zIndex: 120
                        }}
                      />
                    );
                  } else {
                    return (
                      <div
                        key={ind}
                        style={{
                          width: 25,

                          height: 25,
                          borderRadius: "100%",
                          background: "green",
                          marginLeft: "10px",
                          zIndex: 120
                        }}
                      />
                    );
                  }
                }
              })}
            </div>

            <div style={{ position: "absolute", display: "flex" }}>
              {this.state.cm.map((obj, ind) => {
                if (this.state.level < 2) {
                  if (obj === "-") {
                    return (
                      <div
                        key={ind}
                        style={{
                          width: 75,
                          height: 25,
                          backgroundColor: "rgba(255,255,255, 0.5)",
                          marginLeft: "10px",
                          border: "1px solid black",
                          zIndex: 130
                        }}
                      />
                    );
                  } else {
                    return (
                      <div
                        key={ind}
                        style={{
                          width: 25,
                          height: 25,
                          borderRadius: "100%",
                          backgroundColor: "rgba(255,255,255, 0.5)",
                          marginLeft: "10px",
                          border: "1px solid black",
                          zIndex: 130
                        }}
                      />
                    );
                  }
                }
              })}
            </div>
            <div
              id="click"
              className="container mt-5 ml-0"
              style={{
                border: "1px solid black",
                maxWidth: "500px",
                minHeight: 100,
                position: "absolute",
                top: 0,
                textAlign: "center",
                paddingTop: 43
              }}
            >
              <p> click aqui ou pressione qualquer tecla</p>
            </div>

            <div
              className="container mt-5 ml-0"
              onClick={() => {
                this.setState({ iniciado: true }), this.pickRandom();
              }}
              style={{
                maxWidth: "500px",
                minHeight: 100,

                position: "absolute",
                top: 0,
                background: "#e3e1e1",
                opacity: 1,
                display: this.coverDisplay(),
                fontSize: 30,
                textAlign: "center",
                paddingTop: 30
              }}
            >
              <p> click aqui para começar</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  morse: state.morseReducers
});

export default connect(
  mapStateToProps,
  { resetLista, defHigh, defLow, createCTX, setContext, setPage }
)(LearnMorse);
