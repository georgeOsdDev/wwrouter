package quickstart.action

import xitrum.{Action, SkipCsrfCheck, WebSocketAction, WebSocketText}
import xitrum.annotation.{GET, POST, PUT, DELETE, WEBSOCKET}

@GET("msgs")
class GETMsg extends Action with SkipCsrfCheck {
  def execute() {
    respondJson(Map("serverAPI" -> "GETMsg"))
  }
}

@POST("msgs")
class POSTMsg extends Action with SkipCsrfCheck {
  def execute() {
    respondJson(Map("serverAPI" -> "POSTMsg"))
  }
}

@PUT("msgs")
class PUTMsg extends Action with SkipCsrfCheck {
  def execute() {
    respondJson(Map("serverAPI" -> "PUTMsg"))
  }
}

@DELETE("msgs")
class DELETEMsg extends Action with SkipCsrfCheck {
  def execute() {
    respondJson(Map("serverAPI" -> "DELETEMsg"))
  }
}

@GET("msgs/:id")
class GETMsgByID extends Action with SkipCsrfCheck {
  def execute() {
    respondJson(Map("serverAPI" -> "GETMsgByID", "id" -> param("id")))
  }
}

@POST("msgs/:id")
class POSTMsgByID extends Action with SkipCsrfCheck {
  def execute() {
    respondJson(Map("serverAPI" -> "POSTMsgByID", "id" -> param("id")))
  }
}

@PUT("msgs/:id")
class PUTMsgByID extends Action with SkipCsrfCheck {
  def execute() {
    respondJson(Map("serverAPI" -> "PUTMsgByID", "id" -> param("id")))
  }
}

@DELETE("msgs/:id")
class DELETEMsgByID extends Action with SkipCsrfCheck {
  def execute() {
    respondJson(Map("serverAPI" -> "DELETEMsgByID", "id" -> param("id")))
  }
}

@WEBSOCKET("rooms/:roomId")
class WorkerActor extends WebSocketAction {
  def execute() {
    respondWebSocketText(s"Welcome to ${param("roomId")}")

    context.become {
      case WebSocketText(text) =>
        log.debug(text)
        respondWebSocketText("ECHO => " +text)
    }
  }

  override def postStop() {
    log.info("onStop")
    super.postStop()
  }
}