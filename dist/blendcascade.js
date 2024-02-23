/*! BlendCascade v1.2 | (c) Michele Beltrame - https://www.cattlegrid.info/ | MIT License */

blendcascade = {
  cnt: null,
  cnt_width: null,
  cnt_height: null,
  creation_speed: null,
  animation_speed: null,
  restart_on_resize: null,
  pieces: [],

  pieces_factory: null,

  init: function(args) {
    const self = this;

    self.cnt = document.querySelector(args.container);

    self.creation_speed = args.creation_speed || 1000;
    self.animation_speed = args.animation_speed || '10s';
    self.piece_relative_width = args.piece_relative_width || 0.2;
    self.rotate_pieces = args.rotate_pieces || false;
    self.restart_on_resize = args.restart_on_resize === false ? false : true;

    self.cnt.style.position = 'relative';
    self.cnt.style.overflow = 'hidden';

    self.pieces = document.querySelectorAll(args.pieces);

    if ( self.restart_on_resize ) {
      console.info("X");
      window.addEventListener('resize', function() {
        self.stop();
        self.start();
      });
    }

    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState == "visible") {
        self.stop();
        self.start();
      } else {
        self.stop();
      }
    });

    self.stop(); // Clear the div, just in case
    self.start();
  },

  start: function() {
    const self = this;

    self.cnt_width = self.cnt.offsetWidth;
    self.cnt_height = self.cnt.offsetHeight;

    let last_picked_idx = null;
    let max_idx = self.pieces.length - 1;
    let previous_left_pos = 0;
    const do_cascade = function() {
      last_picked_idx = last_picked_idx === null || last_picked_idx === max_idx   ? 0
                                                                                  : last_picked_idx + 1;
      const piece = self.pieces[last_picked_idx].cloneNode(true);
      const piece_width = Math.floor(self.cnt_width * self.piece_relative_width);
      const piece_height = piece_width;
      piece.style.width = piece_width + 'px';
      piece.style.height = piece_height + 'px';

      // Initial position
      piece.style.position = 'absolute';
      // Top just a bit above the container so it enters slowly
      piece.style.top = '-' + (piece_height+1) + 'px';
      // For horizontal position, random is not random enough and makes some letters to be too close to each other
      // If it's too near the previous, recompute
      let left_pos = null;
      let left_pos_ok = false;
      while ( !left_pos_ok ) {
        if ( left_pos === null || left_pos < 0 || Math.abs(left_pos - previous_left_pos) < (piece_width) ) {
          left_pos = Math.random() * self.cnt_width - piece_width;
        } else {
          left_pos_ok = true;
        }
      }
      previous_left_pos = left_pos;

      piece.style.left = left_pos + 'px';

      piece.style.transition = 'all ' + self.animation_speed;
      piece.addEventListener('transitionend', function() {
        self.cnt.removeChild(piece);
      });
      setTimeout(function() {
        let mytransform = 'translate(0px, ' + (self.cnt_height+(piece_height*2)+1) + 'px)';
        if ( self.rotate_pieces ) {
          // Add 720 to have a chance to have negative values
          mytransform += ' rotate(' + (Math.random() * 720 - 360) + 'deg)';
        }
        piece.style.transform = mytransform;
      }, 100); // Little delay or it won't animate

      self.cnt.appendChild(piece);
    };

    do_cascade();
    self.pieces_factory = window.setInterval(function() {
      do_cascade();
    }, Math.floor((self.creation_speed/2) + Math.random()*self.creation_speed));
  },

  stop : function() {
    const self = this;
    window.clearInterval(self.pieces_factory);
    self.cnt.innerHTML = '';
  }
};
